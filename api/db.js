/**
 * Neon Database Connection Pool
 * 
 * Provides a reusable connection pool for querying Neon PostgreSQL database.
 * All product data is stored in and retrieved from Neon - this is the single source of truth.
 * Uses connection pooling for efficient database usage.
 * 
 * Required: SGR_DATABASE_URL (preferred) or DATABASE_URL environment variable with Neon connection string
 */

import pg from 'pg'
const { Pool } = pg
import { notifyWebhook } from './notifyWebhook.js'

let pool = null

function isInsertStatement(text) {
  const sql = String(text || '').trimStart().toUpperCase()
  if (!sql) return false
  // Direct INSERT
  if (sql.startsWith('INSERT')) return true
  // CTE with INSERT, e.g. "WITH ... INSERT INTO ..."
  if (sql.startsWith('WITH') && /\bINSERT\s+INTO\b/.test(sql)) return true
  return false
}

/**
 * Get or create the database connection pool
 * @returns {pg.Pool}
 */
export function getPool() {
  if (pool) {
    return pool
  }

  // Prioritize SGR_DATABASE_URL for Neon, fallback to SPR_DATABASE_URL (legacy) then DATABASE_URL
  const connectionString =
    process.env.SGR_DATABASE_URL ||
    process.env.SPR_DATABASE_URL ||
    process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error(
      'SGR_DATABASE_URL (preferred), SPR_DATABASE_URL (legacy), or DATABASE_URL environment variable is not set. Please configure your Neon database connection string.'
    )
  }

  // Create connection pool
  pool = new Pool({
    connectionString: connectionString,
    // SSL is required for Neon connections
    ssl: process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false } 
      : { rejectUnauthorized: false },
    // Connection pool settings - optimized for Neon
    max: 10, // Maximum number of clients in the pool
    idleTimeoutMillis: 60000, // Close idle clients after 60 seconds (increased for long-running syncs)
    connectionTimeoutMillis: 20000, // Increased timeout for Neon handshake
    // Statement timeout to prevent runaway queries (30 seconds)
    statement_timeout: 30000,
    // Query timeout
    query_timeout: 30000,
  })

  // Handle pool errors
  pool.on('error', (err) => {
    console.error('[DB] Unexpected error on idle client', err)
  })

  return pool
}

/**
 * Collect query timings for all db queries executed inside `fn`.
 *
 * This works by temporarily wrapping the underlying pool.query() method.
 * It does NOT change behavior of `query()` outside this scope.
 *
 * @template T
 * @param {() => Promise<T>} fn
 * @returns {Promise<{ result: T, timings: Array<{ sql: string, durationMs: number, rowCount?: number|null, ok: boolean, error?: string }> }>}
 */
export async function withQueryTimings(fn) {
  const p = getPool()
  const original = p.query.bind(p)
  const timings = []

  /** @type {import('pg').Pool['query']} */
  async function wrappedQuery(text, params) {
    const start = Date.now()
    try {
      const res = await original(text, params)
      const durationMs = Date.now() - start
      timings.push({
        sql: String(text || '').substring(0, 500),
        durationMs,
        rowCount: typeof res?.rowCount === 'number' ? res.rowCount : null,
        ok: true,
      })
      return res
    } catch (e) {
      const durationMs = Date.now() - start
      timings.push({
        sql: String(text || '').substring(0, 500),
        durationMs,
        ok: false,
        error: e?.message || String(e),
      })
      throw e
    }
  }

  try {
    p.query = wrappedQuery
    const result = await fn()
    return { result, timings }
  } finally {
    p.query = original
  }
}

/**
 * Execute a query with error handling
 * @param {string} text - SQL query text
 * @param {any[]} params - Query parameters
 * @returns {Promise<pg.QueryResult>}
 */
export async function query(text, params) {
  const pool = getPool()
  const start = Date.now()
  
  try {
    const result = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('[DB] Query executed', { text: text.substring(0, 50), duration, rows: result.rowCount })
    
    // Alert on slow queries (even if successful)
    const SLOW_QUERY_THRESHOLD_MS = parseInt(process.env.ALERT_SLOW_QUERY_THRESHOLD_MS || '1000', 10)
    // Do not alert on INSERT timings (noise). INSERTs should only alert on failure.
    if (duration > SLOW_QUERY_THRESHOLD_MS && !isInsertStatement(text)) {
      const { sendSlackAlert } = await import('./slackAlerts.js')
      void sendSlackAlert({
        statusCode: 200, // Not an error, but performance issue
        error: `Slow database query detected: ${duration}ms`,
        endpoint: 'database',
        method: 'QUERY',
        context: {
          queryType: 'slow_query',
          durationMs: duration,
          sql: String(text || '').substring(0, 200),
          rowCount: result.rowCount,
        },
        queryDuration: duration,
        dedupeKey: `db:slow:${text.substring(0, 50)}`,
        dedupeTtlMs: 60 * 1000, // 1 minute for slow query alerts
      })
    }
    
    return result
  } catch (error) {
    const duration = Date.now() - start
    console.error('[DB] Query error', { text: text.substring(0, 50), duration, error: error.message })

    // Enhanced alert with performance and context
    const { sendSlackAlert } = await import('./slackAlerts.js')
    void sendSlackAlert({
      statusCode: 500,
      error: error?.message || 'Database query failed',
      endpoint: 'database',
      method: 'QUERY',
      context: {
        errorName: error?.name,
        errorCode: error?.code,
        sql: String(text || '').substring(0, 200),
        paramCount: params?.length || 0,
      },
      queryDuration: duration,
      stack: error?.stack,
      dedupeKey: `db:${error?.code || ''}:${error?.message || 'unknown'}`,
    })

    // Make.com webhook alert (best-effort, deduped) - legacy support
    void notifyWebhook({
      event: 'db.query_error',
      title: '❌ Neon query failed',
      message: error?.message || 'Unknown error',
      context: {
        code: error?.code,
        durationMs: duration,
        sql: String(text || '').substring(0, 200),
      },
      dedupeKey: `db:${error?.code || ''}:${error?.message || 'unknown'}`,
    })

    // If Neon drops connections, retry once with a fresh pool.
    const msg = String(error?.message || '')
    const code = error?.code
    const retryable =
      code === '57P01' || // admin shutdown
      code === 'ECONNRESET' ||
      code === 'ETIMEDOUT' ||
      code === 'ENOTFOUND' ||
      code === 'EAI_AGAIN' ||
      msg.includes('Connection terminated') ||
      msg.includes('timeout') ||
      msg.includes('ECONNRESET') ||
      msg.includes('SSL') ||
      msg.includes('TLS') ||
      msg.includes('bad record mac') ||
      msg.includes('ssl3_read_bytes') ||
      msg.includes('connection closed') ||
      msg.includes('socket hang up')

    if (retryable) {
      console.warn('[DB] Retryable connection error detected, resetting pool and retrying once...', {
        code,
        message: msg.substring(0, 100)
      })
      try {
        await closePool()
      } catch {}
      // Small delay to let connections fully close
      await new Promise(resolve => setTimeout(resolve, 100))
      const fresh = getPool()
      return await fresh.query(text, params)
    }

    throw error
  }
}

/**
 * Close the connection pool (useful for cleanup in tests)
 */
export async function closePool() {
  if (pool) {
    await pool.end()
    pool = null
  }
}

