import { createRequire } from 'module'
import { query } from './db.js'

const require = createRequire(import.meta.url)
const { SquareClient, SquareEnvironment } = require('square')

function getSquareEnv() {
  const env = (process.env.SQUARE_ENVIRONMENT || (process.env.NODE_ENV === 'production' ? 'production' : 'sandbox')).toLowerCase()
  return env === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox
}

function chunk(arr, size) {
  const out = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

async function ensureProductsCacheSchema() {
  // Create table if missing, and add columns idempotently.
  await query(
    `CREATE TABLE IF NOT EXISTS products_cache (
      id TEXT PRIMARY KEY,
      square_item_id TEXT,
      square_variation_id TEXT,
      name TEXT NOT NULL,
      description TEXT,
      price_cents BIGINT NOT NULL DEFAULT 0,
      category TEXT,
      all_categories TEXT[],
      stock_count INTEGER NOT NULL DEFAULT 0,
      image_url TEXT,
      rating NUMERIC,
      review_count INTEGER,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )`,
  )

  // Ensure generated column exists (if supported). If the column already exists as non-generated,
  // this will error; so we only add it when missing.
  const col = await query(
    `SELECT 1 FROM information_schema.columns WHERE table_name='products_cache' AND column_name='price_dollars' LIMIT 1`,
  )
  if (col.rows.length === 0) {
    await query(
      `ALTER TABLE products_cache
       ADD COLUMN price_dollars NUMERIC GENERATED ALWAYS AS (price_cents / 100.0) STORED`,
    )
  }

  // Columns used elsewhere in the codebase.
  await query(`ALTER TABLE products_cache ADD COLUMN IF NOT EXISTS sold_count INTEGER NOT NULL DEFAULT 0`)
  await query(`ALTER TABLE products_cache ADD COLUMN IF NOT EXISTS last_sold_at TIMESTAMPTZ`)
  await query(`ALTER TABLE products_cache ADD COLUMN IF NOT EXISTS last_stocked_at TIMESTAMPTZ`)
  await query(`ALTER TABLE products_cache ADD COLUMN IF NOT EXISTS last_adjustment_at TIMESTAMPTZ`)
}

async function fetchAllCatalogItems(client) {
  const items = []
  let cursor = undefined
  const accessToken = process.env.SQUARE_ACCESS_TOKEN
  const squareVersion = '2025-10-16' // Square API version

  while (true) {
    // Use direct REST API to ensure we get all fields including created_at
    const url = new URL('https://connect.squareup.com/v2/catalog/list')
    url.searchParams.set('types', 'ITEM')
    if (cursor) {
      url.searchParams.set('cursor', cursor)
    }

    const resp = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Square-Version': squareVersion,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!resp.ok) {
      const errorText = await resp.text().catch(() => '')
      throw new Error(`Square API error: ${resp.status} ${resp.statusText} - ${errorText}`)
    }

    const data = await resp.json()
    const objects = data?.objects || []
    for (const obj of objects) {
      if (obj?.type === 'ITEM') items.push(obj)
    }
    cursor = data?.cursor
    if (!cursor) break
  }

  return items
}

async function fetchCatalogObjectsByIds(client, ids) {
  if (!ids.length) return new Map()
  const out = new Map()

  for (const batch of chunk(ids, 100)) {
    const resp = await client.catalog.batchGet({
      objectIds: batch,
      includeRelatedObjects: false,
    })
    // Square SDK response shapes vary across endpoints/versions:
    // - Some return { objects, relatedObjects } directly
    // - Some return Page-like wrappers with `.response`
    const objects =
      resp?.objects ||
      resp?.response?.objects ||
      resp?.result?.objects ||
      resp?.data?.objects ||
      []
    for (const obj of objects) {
      if (obj?.id) out.set(obj.id, obj)
    }
  }

  return out
}

async function fetchInventoryCounts(client, variationIds, locationId) {
  const map = new Map()
  if (!locationId) return map
  const ids = variationIds.filter(Boolean)
  if (!ids.length) return map

  for (const batch of chunk(ids, 200)) {
    const resp = await client.inventory.batchGetCounts({
      catalogObjectIds: batch,
      locationIds: [locationId],
    })
    const counts = resp?.response?.counts || []
    for (const c of counts) {
      const id = c?.catalogObjectId
      if (!id) continue
      // quantity is returned as a string.
      const qty = Number(String(c.quantity || '0'))
      map.set(id, (map.get(id) || 0) + (Number.isFinite(qty) ? qty : 0))
    }
  }
  return map
}

function normalizeCategories(itemData, categoryNameById) {
  const ids = []
  if (itemData?.categoryId) ids.push(itemData.categoryId)
  if (Array.isArray(itemData?.categories)) {
    for (const c of itemData.categories) {
      if (c?.id) ids.push(c.id)
    }
  }
  const names = ids.map((id) => categoryNameById.get(id)).filter(Boolean)
  const unique = [...new Set(names)]
  return {
    category: unique[0] || 'Uncategorized',
    allCategories: unique,
  }
}

function pickImageUrl(itemData, imageObjById) {
  // Handle both camelCase (SDK) and snake_case (REST API) formats
  const imageIds = Array.isArray(itemData?.imageIds) ? itemData.imageIds : 
                   Array.isArray(itemData?.image_ids) ? itemData.image_ids : []
  for (const id of imageIds) {
    const obj = imageObjById.get(id)
    // Handle both camelCase and snake_case image data
    const url = obj?.imageData?.url || obj?.image_data?.url
    if (url) return String(url)
  }
  return ''
}

function getPriceCents(variationObj) {
  // Handle both camelCase (SDK) and snake_case (REST API) formats
  const variationData = variationObj?.itemVariationData || variationObj?.item_variation_data || {}
  const money = variationData?.priceMoney || variationData?.price_money
  const amt = money?.amount
  if (amt == null) return 0
  // Some SDKs return bigint-like strings
  const n = Number(amt)
  return Number.isFinite(n) ? Math.round(n) : 0
}

export async function syncSquareToNeon({
  squareItemIds,
  squareVariationIds,
  full = false,
  limit = 0,
} = {}) {
  await ensureProductsCacheSchema()

  const accessToken = process.env.SQUARE_ACCESS_TOKEN
  const locationId = process.env.SQUARE_LOCATION_ID
  if (!accessToken) throw new Error('SQUARE_ACCESS_TOKEN is not set')
  if (!locationId) throw new Error('SQUARE_LOCATION_ID is not set')

  // For direct REST API calls, we still need the client for other operations (inventory, batchGet)
  const client = new SquareClient({
    token: accessToken,
    environment: getSquareEnv(),
  })

  let items = []
  if (full) {
    items = await fetchAllCatalogItems(client)
  } else if (Array.isArray(squareItemIds) && squareItemIds.length) {
    const map = await fetchCatalogObjectsByIds(client, squareItemIds)
    items = [...map.values()].filter((o) => o?.type === 'ITEM')
  } else if (Array.isArray(squareVariationIds) && squareVariationIds.length) {
    // If given variations, fetch their parent items by retrieving related objects.
    // Cheapest approach: fetch all items and filter (acceptable for small catalogs).
    const all = await fetchAllCatalogItems(client)
    const wanted = new Set(squareVariationIds.map(String))
    items = all.filter((it) =>
      Array.isArray(it?.itemData?.variations) &&
      it.itemData.variations.some((v) => wanted.has(String(v.id))),
    )
  } else {
    throw new Error('Provide full=true, squareItemIds, or squareVariationIds')
  }

  if (limit && items.length > limit) items = items.slice(0, limit)

  // Collect category + image IDs for lookup
  const categoryIds = new Set()
  const imageIds = new Set()
  const variationIds = []

  for (const it of items) {
    // Handle both camelCase (SDK) and snake_case (REST API) response formats
    const d = it?.itemData || it?.item_data || {}
    if (d.categoryId || d.category_id) categoryIds.add(d.categoryId || d.category_id)
    if (Array.isArray(d.categories)) {
      for (const c of d.categories) if (c?.id) categoryIds.add(c.id)
    }
    if (Array.isArray(d.imageIds) || Array.isArray(d.image_ids)) {
      const ids = d.imageIds || d.image_ids || []
      for (const id of ids) if (id) imageIds.add(id)
    }
    if (Array.isArray(d.variations)) {
      for (const v of d.variations) if (v?.id) variationIds.push(String(v.id))
    }
  }

  const categoryObjById = await fetchCatalogObjectsByIds(client, [...categoryIds])
  const imageObjById = await fetchCatalogObjectsByIds(client, [...imageIds])
  const categoryNameById = new Map()
  for (const [id, obj] of categoryObjById.entries()) {
    const name = obj?.categoryData?.name
    if (name) categoryNameById.set(id, String(name))
  }

  const inventoryByVar = await fetchInventoryCounts(client, variationIds, locationId)

  // Build rows (one row per variation)
  const rows = []
  for (const it of items) {
    const itemId = String(it.id || '')
    // Handle both camelCase (SDK) and snake_case (REST API) response formats
    const d = it?.itemData || it?.item_data || {}
    const { category, allCategories } = normalizeCategories(d, categoryNameById)
    const imageUrl = pickImageUrl(d, imageObjById)
    const description = String(d.description || '')

    // Handle both camelCase and snake_case variations
    const variations = Array.isArray(d.variations) ? d.variations : []
    for (const v of variations) {
      const variationId = String(v?.id || '')
      if (!variationId) continue

      // Only sync requested variations when squareVariationIds was provided.
      if (Array.isArray(squareVariationIds) && squareVariationIds.length && !full) {
        const want = new Set(squareVariationIds.map(String))
        if (!want.has(variationId)) continue
      }

      const id = `variation-${variationId}`
      const priceCents = getPriceCents(v)
      let stockCount = inventoryByVar.get(variationId) ?? 0
      
      // Check if variation is available at location
      // Square uses presentAtLocationIds to indicate availability
      // If present at location but inventory count is 0, set to at least 1
      // Handle both camelCase (SDK) and snake_case (REST API) formats
      const variationData = v?.itemVariationData || v?.item_variation_data || {}
      const presentAtLocationIds = Array.isArray(variationData.presentAtLocationIds) 
        ? variationData.presentAtLocationIds 
        : Array.isArray(variationData.present_at_location_ids)
        ? variationData.present_at_location_ids
        : (Array.isArray(v.presentAtLocationIds) ? v.presentAtLocationIds : 
           Array.isArray(v.present_at_location_ids) ? v.present_at_location_ids : [])
      
      // Check if variation is available at THIS location
      // Must explicitly include the locationId, not just have any locations
      const isAvailable = presentAtLocationIds.includes(locationId) ||
                         variationData.available === true ||
                         v.available === true
      
      // If available at this location but inventory count is 0, set to at least 1
      // If not available, ensure it's 0
      if (isAvailable && stockCount === 0) {
        stockCount = 1  // At least 1 if available
      } else if (!isAvailable) {
        stockCount = 0  // Ensure 0 if not available
      }

      // Name strategy: most stores use 1 variation per item; keep it simple.
      const name = String(d.name || '')

      // Square Catalog API returns snake_case (created_at, updated_at) from REST API
      // SDK may return camelCase (createdAt, updatedAt)
      // Prefer created_at for creation date, fallback to updated_at if not available
      const squareCreatedAt = it.created_at || it.createdAt || null
      const squareUpdatedAt = it.updated_at || it.updatedAt || null
      
      rows.push({
        id,
        square_item_id: itemId,
        square_variation_id: variationId,
        name,
        description,
        price_cents: priceCents,
        category,
        all_categories: allCategories,
        stock_count: stockCount,
        image_url: imageUrl,
        created_at: squareCreatedAt || squareUpdatedAt, // Use Square's createdAt if available, else updatedAt
        updated_at: squareUpdatedAt,
      })
    }
  }

  // Upsert rows
  let upserted = 0
  for (const r of rows) {
    await query(
      `INSERT INTO products_cache (
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
         created_at,
         updated_at,
         last_stocked_at
       ) VALUES (
         $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
         COALESCE((SELECT rating FROM products_cache WHERE id = $1), 0),
         COALESCE((SELECT review_count FROM products_cache WHERE id = $1), 0),
         COALESCE($11::timestamptz, CURRENT_TIMESTAMP),
         COALESCE($12::timestamptz, CURRENT_TIMESTAMP),
         CASE 
           WHEN $9 > 0 THEN CURRENT_TIMESTAMP
           ELSE (SELECT last_stocked_at FROM products_cache WHERE id = $1)
         END
       )
       ON CONFLICT (id) DO UPDATE SET
         square_item_id = EXCLUDED.square_item_id,
         square_variation_id = EXCLUDED.square_variation_id,
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         price_cents = EXCLUDED.price_cents,
         category = EXCLUDED.category,
         all_categories = EXCLUDED.all_categories,
         stock_count = EXCLUDED.stock_count,
         image_url = EXCLUDED.image_url,
         -- Preserve original created_at (don't overwrite on updates)
         -- Only set created_at if it doesn't exist yet (new product)
         created_at = COALESCE(products_cache.created_at, EXCLUDED.created_at),
         updated_at = EXCLUDED.updated_at,
         last_stocked_at = CASE
           -- If stock went from 0 (or null) to > 0, update last_stocked_at
           WHEN EXCLUDED.stock_count > 0 AND (products_cache.stock_count IS NULL OR products_cache.stock_count = 0) THEN CURRENT_TIMESTAMP
           -- If stock increased (but was already > 0), update last_stocked_at
           WHEN EXCLUDED.stock_count > products_cache.stock_count AND products_cache.stock_count > 0 THEN CURRENT_TIMESTAMP
           -- Otherwise keep existing value
           ELSE products_cache.last_stocked_at
         END`,
      [
        r.id,
        r.square_item_id,
        r.square_variation_id,
        r.name,
        r.description,
        r.price_cents,
        r.category,
        r.all_categories,
        r.stock_count,
        r.image_url,
        r.created_at,
        r.updated_at,
      ],
    )
    upserted += 1
  }

  // Delete products that no longer exist in Square (only for full syncs)
  let deleted = 0
  if (full && rows.length > 0) {
    // Get all variation IDs that exist in Square
    const squareVariationIds = [...new Set(rows.map(r => r.square_variation_id).filter(Boolean))]
    
    if (squareVariationIds.length > 0) {
      // Delete products where square_variation_id is not in the current Square catalog
      // Only delete if square_variation_id is set (to avoid deleting products that were never synced from Square)
      const placeholders = squareVariationIds.map((_, i) => `$${i + 1}`).join(',')
      const deleteResult = await query(
        `DELETE FROM products_cache 
         WHERE square_variation_id IS NOT NULL 
         AND square_variation_id != ''
         AND square_variation_id NOT IN (${placeholders})`,
        squareVariationIds
      )
      deleted = deleteResult.rowCount || 0
      
      if (deleted > 0) {
        console.log(`[Square Sync] Deleted ${deleted} products that no longer exist in Square`)
      }
    }
  }

  return {
    items: items.length,
    variations: rows.length,
    upserted,
    deleted,
  }
}

