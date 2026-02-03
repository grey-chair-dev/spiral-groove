/**
 * GET /api/products
 * 
 * Fetches all products exclusively from the Neon PostgreSQL database.
 * This is the only source of product data - no fallbacks or mock data.
 * 
 * Database: Neon PostgreSQL
 * Table: products_cache
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
 * Maps a database row from products_cache to the Product type
 * @param {Object} row - Database row from products_cache table
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
    rating: row.rating != null ? Number(row.rating) : 0,
    reviewCount: row.review_count != null ? Number(row.review_count) : 0,
    soldCount: row.sold_count != null ? Number(row.sold_count) : 0,
    lastSoldAt: row.last_sold_at ? String(row.last_sold_at) : null,
    lastStockedAt: row.last_stocked_at ? String(row.last_stocked_at) : null,
    lastAdjustmentAt: row.last_adjustment_at ? String(row.last_adjustment_at) : null,
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

    // Query all albums from albums_cache table (pre-filtered, faster queries)
    // albums_cache is populated after each sync and contains only albums
    // Filter out products with 0 stock that haven't been stocked in the last month
    // Order by created_at descending to show newest first
    // Note: price_dollars is a generated column from price_cents
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    const oneMonthAgoISO = oneMonthAgo.toISOString()
    
    // Check if albums_cache table exists, fallback to products_cache if not
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'albums_cache'
      ) as exists
    `)
    const useAlbumsCache = tableCheck.rows[0]?.exists === true
    
    const tableName = useAlbumsCache ? 'albums_cache' : 'products_cache'
    
    // If using products_cache, we need the full filtering logic
    // If using albums_cache, it's already filtered to albums only
    if (useAlbumsCache) {
      // Query from albums_cache (already filtered to albums)
      // Uses indexes: idx_albums_cache_created_at for sorting, composite indexes for filtering
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
          rating,
          review_count,
          sold_count,
          last_sold_at,
          last_stocked_at,
          last_adjustment_at,
          created_at
        FROM albums_cache
        WHERE 
          -- Stock filtering: show products with stock OR recently stocked
          stock_count > 0
          OR
          (
            stock_count = 0 
            AND (
              (last_stocked_at IS NOT NULL AND last_stocked_at >= $1::timestamptz)
              OR
              (last_stocked_at IS NULL AND created_at >= $1::timestamptz)
            )
          )
        ORDER BY created_at DESC, id ASC`,
        [oneMonthAgoISO]
      )
      
      // Map database rows to Product type
      const products = result.rows.map(mapRowToProduct)
      console.log('[Products API] Fetched albums from albums_cache', { count: products.length })
      
      // Update cache
      lastProducts = products
      lastFetchedAt = Date.now()
      
      return new Response(
        JSON.stringify({ products }),
        {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        }
      )
    } else {
      // Fallback to products_cache with full filtering (for backwards compatibility)
      const albumCategories = [
        'New Vinyl', 'Used Vinyl', '33New', '33Used', '45',
        'Rock', 'Jazz', 'Blues', 'Country', 'Folk', 'Electronic', 'Funk/Soul', 
        'Indie', 'Industrial', 'Metal', 'Pop', 'Punk/Ska', 'Rap/Hip-Hop', 
        'Reggae', 'Singer Songwriter', 'Soundtracks', 'Bluegrass', 
        'Compilations', 'Other'
      ]
      
      const excludeCategories = [
        "DVD's", 'DVDs', 'Videogames', 'VHS', "CD's", 'CDs', 'Cassettes',
        'Food', 'Drinks', 'Jewelry', 'Equipment', 'T-Shirts', 'Tote Bag',
        'Candles', 'Animals (Minis)', 'Spin Clean', 'Sticker', 'Action Figures',
        'Funko Pop', 'Adapters', 'Buttons', 'Coasters', 'Coffee Mug', 'Crates',
        'Guitar picks', 'Hats', 'Patches', 'Pin', 'Poster', 'Sleeves',
        'Slip Mat', 'Wallets', 'Wristband', 'Book', 'Boombox', 'Bowl',
        'Box Set', 'Incense', 'Charms', 'Sprouts', 'Lava Lamps',
        'Essential Oils', 'Puzzle', 'Record Store Day', 'Miscellaneous',
        'Reel To Reel', 'Vinyl Styl', 'ABL'
      ]
      
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
          rating,
          review_count,
          sold_count,
          last_sold_at,
          last_stocked_at,
          last_adjustment_at,
          created_at
        FROM products_cache
        WHERE 
          (
            category = ANY($1::text[])
            OR 'New Vinyl' = ANY(all_categories)
            OR 'Used Vinyl' = ANY(all_categories)
            OR category IS NULL
          )
          AND (category IS NULL OR category != ALL($2::text[]))
          AND NOT ('DVD' = ANY(all_categories) OR 'DVDs' = ANY(all_categories) OR 'DVD''s' = ANY(all_categories))
          AND NOT ('Videogames' = ANY(all_categories))
          AND (
            stock_count > 0
            OR
            (
              stock_count = 0 
              AND (
                (last_stocked_at IS NOT NULL AND last_stocked_at >= $3::timestamptz)
                OR
                (last_stocked_at IS NULL AND created_at >= $3::timestamptz)
              )
            )
          )
        ORDER BY created_at DESC, id ASC`,
        [albumCategories, excludeCategories, oneMonthAgoISO]
      )
      
      // Map database rows to Product type
      const products = result.rows.map(mapRowToProduct)
      console.log('[Products API] Fetched albums from products_cache (fallback)', { count: products.length })
      
      // Update cache
      lastProducts = products
      lastFetchedAt = Date.now()
      
      return new Response(
        JSON.stringify({ products }),
        {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        }
      )
    }
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
        error.message?.includes('products_cache') ||
        (error.message?.includes('table') && error.message?.includes('not exist'))) {
      console.error('[Products API] ❌ products_cache table does not exist!')
      console.error('[Products API] Run: npm run sync:square')
      userMessage = 'products_cache table does not exist. Run: npm run sync:square'
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
        suggestion: error.message?.includes('does not exist') ? 'Run: npm run sync:square to create the table' : undefined,
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

