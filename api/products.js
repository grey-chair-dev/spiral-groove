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
const CACHE_TTL_MS = 30_000
const STALE_TTL_MS = 10 * 60 * 1000

/**
 * Maps a database row from products to the Product type
 * @param {Object} row - Database row from products table
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
    // `products` doesn't track review/sales metadata; keep API shape stable.
    rating: 0,
    reviewCount: 0,
    soldCount: 0,
    lastSoldAt: null,
    lastStockedAt: null,
    lastAdjustmentAt: null,
    createdAt: row.created_at ? String(row.created_at) : null,
  }
}

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export async function webHandler(request) {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()
  
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
    // Serve hot cache if it's fresh
    if (Array.isArray(lastProducts) && Date.now() - lastFetchedAt < CACHE_TTL_MS) {
      return new Response(
        JSON.stringify({ products: lastProducts }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-store',
            'X-Products-Cache': 'HIT',
          }
        }
      )
    }

    // Check if database connection string is available (prioritize SGR_DATABASE_URL for Neon)
    if (!process.env.SGR_DATABASE_URL && !process.env.SPR_DATABASE_URL && !process.env.DATABASE_URL) {
      throw new Error('SGR_DATABASE_URL (preferred), SPR_DATABASE_URL (legacy), or DATABASE_URL environment variable is not set')
    }

    // Full catalog from `products` table.
    // Keep the API response stable: `id` remains "variation-<square_variation_id>".
    const result = await query(
      `SELECT
        ('variation-' || square_variation_id) AS id,
        name,
        description,
        price_dollars,
        category,
        all_categories,
        stock_count,
        image_url,
        created_at
      FROM products
      ORDER BY created_at DESC NULLS LAST, square_variation_id ASC`
    )

    const products = result.rows.map(mapRowToProduct)
    console.log('[Products API] Fetched products from products table', { count: products.length })

    lastProducts = products
    lastFetchedAt = Date.now()

    return new Response(JSON.stringify({ products }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'X-Products-Source': 'products',
      },
    })
  } catch (error) {
    // If Neon is temporarily down but we have a recent cache, serve it instead of hard failing.
    if (Array.isArray(lastProducts) && Date.now() - lastFetchedAt < STALE_TTL_MS) {
      console.warn('[Products API] Neon error; serving STALE cache', { ageMs: Date.now() - lastFetchedAt })
      return new Response(
        JSON.stringify({ products: lastProducts, stale: true }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-store',
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

