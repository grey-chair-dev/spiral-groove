/**
 * Neon Database Connection Pool
 * 
 * Provides a reusable connection pool for querying Neon PostgreSQL database.
 * All product data is stored in and retrieved from Neon - this is the single source of truth.
 * Uses connection pooling for efficient database usage.
 * 
 * Required: SPR_DATABASE_URL (preferred) or DATABASE_URL environment variable with Neon connection string
 */

import pg from 'pg'
const { Pool } = pg
import { notifyWebhook } from './notifyWebhook.js'

let pool = null

/**
 * Get or create the database connection pool
 * @returns {pg.Pool}
 */
export function getPool() {
  if (pool) {
    return pool
  }

  // Prioritize SPR_DATABASE_URL for Neon, fallback to DATABASE_URL
  const connectionString = process.env.SPR_DATABASE_URL || process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error(
      'SPR_DATABASE_URL or DATABASE_URL environment variable is not set. Please configure your Neon database connection string.'
    )
  }

  // Create connection pool
  pool = new Pool({
    connectionString: connectionString,
    // SSL is required for Neon connections
    ssl: process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false } 
      : { rejectUnauthorized: false },
    // Connection pool settings
    max: 10, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 10000, // Neon can be slow to handshake; don't fail too aggressively
    keepAlive: true,
  })

  // Handle pool errors
  pool.on('error', (err) => {
    console.error('[DB] Unexpected error on idle client', err)
  })

  return pool
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
    return result
  } catch (error) {
    const duration = Date.now() - start
    console.error('[DB] Query error', { text: text.substring(0, 50), duration, error: error.message })

    // Make.com webhook alert (best-effort, deduped)
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
      msg.includes('Connection terminated') ||
      msg.includes('timeout') ||
      msg.includes('ECONNRESET')

    if (retryable) {
      console.warn('[DB] Retryable error detected, resetting pool and retrying once...')
      try {
        await closePool()
      } catch {}
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

