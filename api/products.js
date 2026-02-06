/**
 * GET /api/products
 * 
 * Fetches all products exclusively from the Neon PostgreSQL database.
 * This is the only source of product data - no fallbacks or mock data.
 * 
 * Database: Neon PostgreSQL
 * Table: products
 * 
 * Returns: { products: Product[] }
 * 
 * Requires: DATABASE_URL environment variable pointing to Neon database
 */

import { query } from './db.js'
import { notifyWebhook } from './notifyWebhook.js'
import { sendSlackAlert } from './slackAlerts.js'
import { withWebHandler } from './_vercelNodeAdapter.js'

// Simple in-memory cache to avoid transient Neon outages causing empty inventory.
// - TTL: serve fresh cache for a short window
// - STALE: if Neon errors, serve last-known-good cache for a longer window
let lastProducts = null
let lastFetchedAt = 0
let lastEtag = null
let lastBodyJson = null
const CACHE_TTL_MS = 30_000
const STALE_TTL_MS = 10 * 60 * 1000
const EDGE_CACHE_CONTROL = 'public, s-maxage=60, stale-while-revalidate=600'
const MAX_LIMIT = 5000
// Version check for ETag. We keep this cheap and only run it if the client sends If-None-Match.
// albums_cache is rebuilt in one shot and uses a uniform synced_at per rebuild.
const VERSION_SQL = `SELECT synced_at FROM albums_cache ORDER BY synced_at DESC LIMIT 1`
const PRODUCTS_CACHE_ETAG_SQL = `SELECT etag FROM products_api_cache WHERE id = 1`
const PRODUCTS_CACHE_SQL = `SELECT etag, body_json FROM products_api_cache WHERE id = 1`

/**
 * Maps a database row from albums_cache to the Product type
 * @param {Object} row - Database row from albums_cache table
 * @returns {Object} Product object
 */
function mapRowToProduct(row) {
  // Use price_dollars (generated column from price_cents)
  const price = row.price_dollars != null ? Number(row.price_dollars) : 0
  
  return {
    id: String(row.id || ''),
    name: String(row.name || ''),
    description: String(row.description || ''),
    price: price,
    category: String(row.category || 'Uncategorized'),
    categories: Array.isArray(row.all_categories) ? row.all_categories : [],
    stockCount: Number(row.stock_count || 0),
    imageUrl: String(row.image_url || ''),
    // `albums_cache` doesn't track review/sales metadata; keep API shape stable.
    rating: 0,
    reviewCount: 0,
    soldCount: 0,
    lastSoldAt: null,
    lastStockedAt: null,
    lastAdjustmentAt: null,
    createdAt: row.created_at ? String(row.created_at) : null,
  }
}

function parseLimit(raw) {
  if (raw == null || raw === '') return null
  const n = Number.parseInt(String(raw), 10)
  if (!Number.isFinite(n) || n <= 0) return null
  return Math.min(MAX_LIMIT, n)
}

function decodeCursor(raw) {
  if (!raw) return null
  try {
    const txt = Buffer.from(String(raw), 'base64url').toString('utf8')
    const parsed = JSON.parse(txt)
    if (!parsed || typeof parsed !== 'object') return null
    const createdAt = typeof parsed.createdAt === 'string' ? parsed.createdAt : null
    const id = typeof parsed.id === 'string' ? parsed.id : null
    if (!createdAt || !id) return null
    return { createdAt, id }
  } catch {
    return null
  }
}

function encodeCursor({ createdAt, id }) {
  const txt = JSON.stringify({ createdAt, id })
  return Buffer.from(txt, 'utf8').toString('base64url')
}

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export async function webHandler(request) {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()
  const url = new URL(request.url)
  const limit = parseLimit(url.searchParams.get('limit'))
  const cursor = decodeCursor(url.searchParams.get('cursor'))
  const isPagedRequest = Boolean(limit || cursor)
  const effectiveLimit = cursor && !limit ? 500 : limit
  const ifNoneMatch = request.headers.get('if-none-match') || ''
  let computedEtag = null
  
  // Only allow GET requests
  if (request.method !== 'GET') {
    const { sendSlackAlert } = await import('./slackAlerts.js')
    void sendSlackAlert({
      statusCode: 405,
      error: 'Method not allowed. Use GET.',
      endpoint: '/api/products',
      method: request.method,
      requestId,
      userAgent: request.headers.get('user-agent') || '',
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      dedupeKey: `products:405:${request.method}`,
    })
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Method not allowed. Use GET.' 
      }),
      { 
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    // Fast path: for the default full-catalog request, prefer serving the precomputed payload.
    // This avoids scanning/mapping ~15k rows on every request in serverless.
    if (!isPagedRequest) {
      // Serve hot cache if it's fresh
      if (typeof lastBodyJson === 'string' && Date.now() - lastFetchedAt < CACHE_TTL_MS) {
        if (ifNoneMatch && lastEtag && ifNoneMatch === lastEtag) {
          return new Response(null, {
            status: 304,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Cache-Control': EDGE_CACHE_CONTROL,
              ETag: lastEtag,
              'X-Products-Not-Modified': '1',
              'X-Products-Cache': 'HIT',
            },
          })
        }

        return new Response(lastBodyJson, {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': EDGE_CACHE_CONTROL,
            ...(lastEtag ? { ETag: lastEtag } : {}),
            'X-Products-Cache': 'HIT',
            'X-Products-Source': 'products_api_cache:memory',
          },
        })
      }

      // Try DB precomputed payload (best-effort fallback to live query if missing)
      try {
        // If the client sent If-None-Match, avoid transferring the large `body_json` just to return a 304.
        if (ifNoneMatch) {
          const et = await query(PRODUCTS_CACHE_ETAG_SQL)
          const dbEtagOnly = et.rows?.[0]?.etag ? `"${String(et.rows[0].etag)}"` : null
          if (dbEtagOnly && ifNoneMatch === dbEtagOnly) {
            return new Response(null, {
              status: 304,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': EDGE_CACHE_CONTROL,
                ETag: dbEtagOnly,
                'X-Products-Not-Modified': '1',
                'X-Products-Source': 'products_api_cache:etag',
              },
            })
          }
        }

        const cached = await query(PRODUCTS_CACHE_SQL)
        const dbEtag = cached.rows?.[0]?.etag ? `"${String(cached.rows[0].etag)}"` : null
        const bodyJson = cached.rows?.[0]?.body_json ? String(cached.rows[0].body_json) : null

        if (dbEtag && ifNoneMatch && ifNoneMatch === dbEtag) {
          return new Response(null, {
            status: 304,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Cache-Control': EDGE_CACHE_CONTROL,
              ETag: dbEtag,
              'X-Products-Not-Modified': '1',
              'X-Products-Source': 'products_api_cache',
            },
          })
        }

        if (dbEtag && bodyJson) {
          // refresh memory cache
          lastBodyJson = bodyJson
          lastFetchedAt = Date.now()
          lastEtag = dbEtag

          return new Response(bodyJson, {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Cache-Control': EDGE_CACHE_CONTROL,
              ETag: dbEtag,
              'X-Products-Source': 'products_api_cache',
            },
          })
        }
      } catch {
        // ignore; fall through to live query path
      }
    }

    // If the client sent If-None-Match, do a cheap version check and return 304 when possible.
    // Only applies to the default "full catalog" request.
    if (!isPagedRequest && ifNoneMatch) {
      const v = await query(VERSION_SQL)
      const maxSyncedAt = v.rows?.[0]?.synced_at ? String(v.rows[0].synced_at) : ''
      const etag = `"albums_cache:${maxSyncedAt}"`
      computedEtag = etag

      if (ifNoneMatch && ifNoneMatch === etag) {
        return new Response(null, {
          status: 304,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': EDGE_CACHE_CONTROL,
            ETag: etag,
            'X-Products-Not-Modified': '1',
          },
        })
      }
    }

    // Serve hot cache if it's fresh (only for the default "full catalog" request)
    if (!isPagedRequest && Array.isArray(lastProducts) && Date.now() - lastFetchedAt < CACHE_TTL_MS) {
      return new Response(
        JSON.stringify({ products: lastProducts }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': EDGE_CACHE_CONTROL,
            ...(lastEtag ? { ETag: lastEtag } : {}),
            'X-Products-Cache': 'HIT',
          }
        }
      )
    }

    // Check if database connection string is available (prioritize SGR_DATABASE_URL for Neon)
    if (!process.env.SGR_DATABASE_URL && !process.env.SPR_DATABASE_URL && !process.env.DATABASE_URL) {
      throw new Error('SGR_DATABASE_URL (preferred), SPR_DATABASE_URL (legacy), or DATABASE_URL environment variable is not set')
    }

    // Full catalog from `albums_cache` table.
    // Prefer selecting `id` directly (already "variation-<square_variation_id>") so we can use
    // the existing idx_albums_cache_created_desc (created_at DESC, id ASC) without extra sorting.
    const pageLimit = effectiveLimit ? effectiveLimit + 1 : null // +1 to detect next page
    const result = await query(
      `SELECT
        id,
        name,
        description,
        price_dollars,
        category,
        all_categories,
        stock_count,
        image_url,
        created_at,
        synced_at
      FROM albums_cache
      WHERE
        ($1::timestamptz IS NULL)
        OR (created_at < $1::timestamptz)
        OR (created_at = $1::timestamptz AND id > $2::text)
      ORDER BY created_at DESC NULLS LAST, id ASC
      ${pageLimit ? 'LIMIT $3::int' : ''}`,
      pageLimit
        ? [cursor?.createdAt ?? null, cursor?.id ?? '', pageLimit]
        : [cursor?.createdAt ?? null, cursor?.id ?? '']
    )

    let rows = result.rows || []
    let nextCursor = null
    if (pageLimit && effectiveLimit && rows.length > effectiveLimit) {
      // drop the lookahead row and emit cursor for the next page
      rows = rows.slice(0, effectiveLimit)
      const last = rows[rows.length - 1]
      if (last?.created_at && last?.id) {
        nextCursor = encodeCursor({ createdAt: String(last.created_at), id: String(last.id) })
      }
    }

    const products = rows.map(mapRowToProduct)
    // Avoid noisy logs in production

    // Only cache the default full-catalog response
    if (!isPagedRequest) {
      lastProducts = products
      lastBodyJson = JSON.stringify({ products })
      lastFetchedAt = Date.now()
      const syncedAt = rows?.[0]?.synced_at ? String(rows[0].synced_at) : ''
      lastEtag = `"albums_cache:${syncedAt}"`
      computedEtag = lastEtag
    }

    return new Response(JSON.stringify(nextCursor ? { products, nextCursor } : { products }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': EDGE_CACHE_CONTROL,
        ...(computedEtag ? { ETag: computedEtag } : {}),
        'X-Products-Source': 'albums_cache',
      },
    })
  } catch (error) {
    // If Neon is temporarily down but we have a recent cache, serve it instead of hard failing.
    if (!isPagedRequest && Array.isArray(lastProducts) && Date.now() - lastFetchedAt < STALE_TTL_MS) {
      console.warn('[Products API] Neon error; serving STALE cache', { ageMs: Date.now() - lastFetchedAt })
      return new Response(
        JSON.stringify({ products: lastProducts, stale: true }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': EDGE_CACHE_CONTROL,
            'X-Products-Cache': 'STALE',
          }
        }
      )
    }

    // Log detailed error information
    console.error('[Products API] ========== ERROR ==========')
    console.error('[Products API] Error message:', error.message)
    console.error('[Products API] Error name:', error.name)
    console.error('[Products API] Error stack:', error.stack)
    console.error('[Products API] SGR_DATABASE_URL available:', !!process.env.SGR_DATABASE_URL)
    console.error('[Products API] SPR_DATABASE_URL available:', !!process.env.SPR_DATABASE_URL)
    console.error('[Products API] DATABASE_URL available:', !!process.env.DATABASE_URL)
    console.error('[Products API] ===========================')

    // Make.com webhook alert (best-effort, deduped)
    void notifyWebhook({
      event: 'api.products_error',
      title: '❌ /api/products failed',
      message: error?.message || 'Unknown error',
      context: {
        route: '/api/products',
        name: error?.name,
        hasSgrDatabaseUrl: !!process.env.SGR_DATABASE_URL,
        hasSprDatabaseUrl: !!process.env.SPR_DATABASE_URL,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
      },
      dedupeKey: `products:${error?.message || 'unknown'}`,
    })

    // Enhanced Slack alert for critical database errors
    const responseTime = Date.now() - startTime
    const url = new URL(request.url)
    const queryParams = {}
    for (const [key, value] of url.searchParams.entries()) {
      queryParams[key] = value
    }
    
    const requestHeaders = {}
    const relevantHeaders = ['user-agent', 'referer', 'origin', 'accept']
    for (const header of relevantHeaders) {
      const value = request.headers.get(header)
      if (value) requestHeaders[header] = value
    }
    
    void sendSlackAlert({
      statusCode: 500,
      error: error?.message || 'Unknown error',
      endpoint: '/api/products',
      method: 'GET',
      requestId,
      userAgent: request.headers.get('user-agent') || '',
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      responseTime,
      requestHeaders: Object.keys(requestHeaders).length > 0 ? requestHeaders : undefined,
      queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
      context: {
        errorName: error?.name,
        hasSgrDatabaseUrl: !!process.env.SGR_DATABASE_URL,
        hasSprDatabaseUrl: !!process.env.SPR_DATABASE_URL,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        isConnectionError: error?.message?.includes('connection') || false,
        isTableMissing: error?.message?.includes('does not exist') || false,
        databaseError: true,
      },
      stack: error?.stack,
      dedupeKey: `products:500:${error?.message || 'unknown'}`,
    })
    
    // Determine error type and message
    let errorMessage = 'Failed to fetch products from Neon database.'
    let userMessage = 'All product data must come from Neon. Please check your database connection.'
    
    // Check if it's a database connection error
    if (
      error.message?.includes('DATABASE_URL') ||
      error.message?.includes('SPR_DATABASE_URL') ||
      error.message?.includes('SGR_DATABASE_URL') ||
      error.message?.includes('connection')
    ) {
      console.error('[Products API] Neon database connection failed. Check SGR_DATABASE_URL environment variable.')
      userMessage = 'Database connection failed. Check SGR_DATABASE_URL environment variable.'
    }
    
    // Check if table doesn't exist
    if (error.message?.includes('does not exist') || 
        error.message?.includes('relation') || 
        error.message?.includes('products') ||
        (error.message?.includes('table') && error.message?.includes('not exist'))) {
      console.error('[Products API] ❌ products table does not exist!')
      userMessage = 'products table does not exist.'
    }
    
    // Build error response
    const errorResponse = {
      success: false,
      error: errorMessage,
      message: userMessage,
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message || 'Unknown error',
        name: error.name || 'Error',
        stack: error.stack,
        hasSgrDatabaseUrl: !!process.env.SGR_DATABASE_URL,
        hasSprDatabaseUrl: !!process.env.SPR_DATABASE_URL,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        usingConnectionString: process.env.SGR_DATABASE_URL
          ? 'SGR_DATABASE_URL'
          : (process.env.SPR_DATABASE_URL ? 'SPR_DATABASE_URL' : (process.env.DATABASE_URL ? 'DATABASE_URL' : 'NONE')),
        suggestion: undefined,
      } : undefined
    }
    
    // Always return valid JSON
    return new Response(
      JSON.stringify(errorResponse),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    )
  }
}

// Vercel serverless function configuration
export const config = {
  runtime: 'nodejs',
}

// Vercel Node entrypoint
export default withWebHandler(webHandler)

