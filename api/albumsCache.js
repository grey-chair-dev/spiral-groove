/**
 * Albums Cache Table
 * 
 * A pre-filtered table containing only albums (vinyl records) from products.
 * This table is populated after each sync to enable faster queries.
 * 
 * Benefits:
 * - Faster queries (no need to filter albums on every request)
 * - Pre-applied album filtering logic
 * - Same structure as legacy products_cache for easy querying
 */

import { query } from './db.js'

/**
 * Ensure albums_cache table exists with a products_cache-like structure (legacy).
 */
export async function ensureAlbumsCacheSchema() {
  await query(`
    CREATE TABLE IF NOT EXISTS albums_cache (
      id TEXT PRIMARY KEY,
      square_item_id TEXT,
      square_variation_id TEXT,
      name TEXT NOT NULL,
      description TEXT,
      price_cents BIGINT NOT NULL DEFAULT 0,
      price_dollars NUMERIC(10, 2) GENERATED ALWAYS AS (price_cents / 100.0) STORED,
      category TEXT,
      all_categories TEXT[],
      stock_count INTEGER NOT NULL DEFAULT 0,
      image_url TEXT,
      rating NUMERIC(3, 1) DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      sold_count INTEGER NOT NULL DEFAULT 0,
      last_sold_at TIMESTAMPTZ,
      last_stocked_at TIMESTAMPTZ,
      last_adjustment_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      synced_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Add generated column for sargable “recent activity” filtering (existing tables won’t get it via CREATE TABLE IF NOT EXISTS)
  await query(`
    ALTER TABLE albums_cache
    ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ
    GENERATED ALWAYS AS (COALESCE(last_stocked_at, created_at)) STORED
  `)

  // Create indexes for faster queries
  await query(`
    CREATE INDEX IF NOT EXISTS idx_albums_cache_created_desc 
    ON albums_cache (created_at DESC, id ASC)
  `)
  
  await query(`
    CREATE INDEX IF NOT EXISTS idx_albums_cache_stock_count 
    ON albums_cache (stock_count) 
    WHERE stock_count > 0
  `)
  
  await query(`
    CREATE INDEX IF NOT EXISTS idx_albums_cache_zero_stock_recent 
    ON albums_cache (last_stocked_at, created_at DESC) 
    WHERE stock_count = 0
  `)

  await query(`
    CREATE INDEX IF NOT EXISTS idx_albums_cache_zero_stock_active 
    ON albums_cache (last_active_at, created_at DESC, id ASC)
    WHERE stock_count = 0
  `)
  
  await query(`
    CREATE INDEX IF NOT EXISTS idx_albums_cache_category_created 
    ON albums_cache (category, created_at DESC, id ASC)
  `)
  
  await query(`
    CREATE INDEX IF NOT EXISTS idx_albums_cache_square_variation_id_unique 
    ON albums_cache (square_variation_id) 
    WHERE square_variation_id IS NOT NULL
  `)

  // Fast version check for /api/products ETag (MAX(synced_at))
  await query(`
    CREATE INDEX IF NOT EXISTS idx_albums_cache_synced_at_desc
    ON albums_cache (synced_at DESC)
  `)
}

/**
 * Populate albums_cache table with only albums from products
 * This should be called after each sync completes
 */
export async function populateAlbumsCache() {
  const startTime = Date.now()
  
  await ensureAlbumsCacheSchema()
  
  // Categories that are albums (vinyl records)
  const albumCategories = [
    'New Vinyl', 'Used Vinyl', '33New', '33Used', '45',
    'Rock', 'Jazz', 'Blues', 'Country', 'Folk', 'Electronic', 'Funk/Soul', 
    'Indie', 'Industrial', 'Metal', 'Pop', 'Punk/Ska', 'Rap/Hip-Hop', 
    'Reggae', 'Singer Songwriter', 'Soundtracks', 'Bluegrass', 
    'Compilations', 'Other'
  ]
  
  // Categories to exclude (non-album items)
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
  
  // Hide brand-new out-of-stock items (created within the last week)
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const oneWeekAgoISO = oneWeekAgo.toISOString()
  
  console.log('[Albums Cache] Starting population...')
  
  // Clear existing albums_cache
  await query('TRUNCATE TABLE albums_cache')
  
  // Insert only albums from products
  // Note: `products` does not have sold_count/last_stocked_at metadata; we populate those as defaults.
  const result = await query(`
    INSERT INTO albums_cache (
      id,
      square_item_id,
      square_variation_id,
      name,
      description,
      price_cents,
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
      created_at,
      updated_at,
      synced_at
    )
    SELECT 
      ('variation-' || square_variation_id) AS id,
      square_item_id,
      square_variation_id,
      name,
      description,
      COALESCE(price_cents, 0) AS price_cents,
      category,
      all_categories,
      stock_count,
      image_url,
      0::numeric AS rating,
      0::int AS review_count,
      0::int AS sold_count,
      NULL::timestamptz AS last_sold_at,
      NULL::timestamptz AS last_stocked_at,
      NULL::timestamptz AS last_adjustment_at,
      created_at,
      updated_at,
      CURRENT_TIMESTAMP as synced_at
    FROM products
    WHERE 
      -- Only albums: category must be in album categories OR all_categories contains vinyl
      -- Include uncategorized items (will be manually updated over time)
      (
        category = ANY($1::text[])
        OR 'New Vinyl' = ANY(all_categories)
        OR 'Used Vinyl' = ANY(all_categories)
        OR category IS NULL  -- Include uncategorized (will be manually updated)
      )
      -- Exclude non-album categories (check both category and all_categories)
      AND (category IS NULL OR category != ALL($2::text[]))
      AND NOT ('DVD' = ANY(all_categories) OR 'DVDs' = ANY(all_categories) OR 'DVD''s' = ANY(all_categories))
      AND NOT ('Videogames' = ANY(all_categories))
      -- Stock filtering:
      -- - include all in-stock items
      -- - include out-of-stock only if NOT brand-new (created_at older than 1 week)
      AND (
        stock_count > 0
        OR (stock_count = 0 AND created_at < $3::timestamptz)
      )
  `, [albumCategories, excludeCategories, oneWeekAgoISO])

  // Post-population maintenance:
  // - REINDEX: ensure btree indexes are rebuilt after large churn (safe to do nightly)
  // - ANALYZE: refresh planner stats for faster ORDER BY / filters
  try {
    await query('REINDEX TABLE albums_cache')
    await query('ANALYZE albums_cache')
  } catch (e) {
    // Best-effort: don't fail the cache build if maintenance statements are unsupported/blocked
    console.warn('[Albums Cache] Post-population REINDEX/ANALYZE failed (continuing)', {
      message: e?.message || String(e),
    })
  }
  
  const durationMs = Date.now() - startTime
  const albumCount = result.rowCount || 0
  
  console.log(`[Albums Cache] Populated ${albumCount} albums in ${durationMs}ms`)
  
  return {
    albumCount,
    durationMs
  }
}
