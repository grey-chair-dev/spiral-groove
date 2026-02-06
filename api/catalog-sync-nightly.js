/**
 * Nightly Square Catalog Sync (Vercel Cron)
 *
 * Runs the Square -> Postgres catalog sync and then rebuilds albums_cache.
 * Designed to be triggered by Vercel Cron (vercel.json "crons").
 *
 * Security:
 * - In production, GET requests must come from Vercel cron (x-vercel-cron header).
 * - POST requests may be used manually if WEBHOOK_SECRET is provided.
 */

import { withWebHandler } from './_vercelNodeAdapter.js'
import { query } from './db.js'
import { sendSlackAlert } from './slackAlerts.js'
import { populateAlbumsCache } from './albumsCache.js'

export const config = { runtime: 'nodejs' }

const SQUARE_VERSION = process.env.SQUARE_VERSION || '2025-10-16'
const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID || 'ATHC6TCDTCHWN'
const SQUARE_ENV = (process.env.SQUARE_ENVIRONMENT || process.env.SQUARE_ENV || 'production').toLowerCase()
const SQUARE_BASE_URL =
  process.env.SQUARE_BASE_URL ||
  (SQUARE_ENV === 'sandbox' ? 'https://connect.squareupsandbox.com' : 'https://connect.squareup.com')

const MAX_PAGES = Math.max(1, parseInt(process.env.CATALOG_SYNC_MAX_PAGES || '500', 10))
const BATCH_PAGES = Math.max(1, parseInt(process.env.CATALOG_SYNC_BATCH_PAGES || '10', 10))

async function ensureStateTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS catalog_sync_state (
      key TEXT PRIMARY KEY,
      value JSONB,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
}

async function getState(key) {
  const r = await query(`SELECT value FROM catalog_sync_state WHERE key = $1 LIMIT 1`, [key])
  return r.rows?.[0]?.value ?? null
}

async function setState(key, value) {
  await query(
    `
    INSERT INTO catalog_sync_state (key, value, updated_at)
    VALUES ($1, $2::jsonb, NOW())
    ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value, updated_at = NOW()
  `,
    [key, JSON.stringify(value)]
  )
}

function utcDateStr() {
  return new Date().toISOString().slice(0, 10)
}

function squareHeaders() {
  const token = process.env.SQUARE_ACCESS_TOKEN
  if (!token) throw new Error('Missing env var: SQUARE_ACCESS_TOKEN')
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Square-Version': SQUARE_VERSION,
  }
}

async function squareFetchJson(path, { method = 'GET', body, qs } = {}) {
  const url = new URL(`${SQUARE_BASE_URL}${path}`)
  if (qs) {
    for (const [k, v] of Object.entries(qs)) url.searchParams.set(k, String(v))
  }
  const res = await fetch(url.toString(), {
    method,
    headers: squareHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let json
  try {
    json = text ? JSON.parse(text) : {}
  } catch {
    json = { raw: text }
  }
  if (!res.ok) {
    const err = new Error(`Square ${method} ${path} failed: ${res.status} ${res.statusText}`)
    err.details = json
    err.status = res.status
    throw err
  }
  return json
}

const UPSERT_CATEGORIES_SQL = `
WITH payload AS (
  SELECT ($1)::jsonb AS j
),
cat_rows AS (
  SELECT
    obj->>'id'                                 AS square_category_id,
    (obj->'category_data'->>'name')::text      AS name,
    (obj->'category_data'->>'parent_id')::text AS parent_square_category_id,
    (obj->>'is_deleted')::boolean              AS is_deleted,
    (obj->>'created_at')::timestamptz          AS square_created_at,
    (obj->>'updated_at')::timestamptz          AS square_updated_at,
    now()                                      AS synced_at
  FROM payload
  CROSS JOIN LATERAL jsonb_array_elements(j) AS obj
  WHERE obj->>'type' = 'CATEGORY'
)
INSERT INTO categories (
  square_category_id,
  name,
  parent_square_category_id,
  is_deleted,
  square_created_at,
  square_updated_at,
  synced_at
)
SELECT
  square_category_id,
  name,
  parent_square_category_id,
  is_deleted,
  square_created_at,
  square_updated_at,
  synced_at
FROM cat_rows
WHERE square_category_id IS NOT NULL
ON CONFLICT (square_category_id) DO UPDATE
SET
  name                      = EXCLUDED.name,
  parent_square_category_id = EXCLUDED.parent_square_category_id,
  is_deleted                = EXCLUDED.is_deleted,
  square_created_at         = EXCLUDED.square_created_at,
  square_updated_at         = EXCLUDED.square_updated_at,
  synced_at                 = EXCLUDED.synced_at;
`

const UPSERT_PRODUCTS_SQL = `
WITH payload AS (
  SELECT ($1)::jsonb AS j
),
items AS (
  SELECT i.*
  FROM payload p
  CROSS JOIN LATERAL jsonb_array_elements(p.j) AS obj
  CROSS JOIN LATERAL jsonb_to_record(obj) AS i(
    type text,
    id text,
    image_id text,
    is_deleted boolean,
    updated_at timestamptz,
    created_at timestamptz,
    version bigint,
    item_data jsonb
  )
  WHERE i.type = 'ITEM'
),
variations AS (
  SELECT
    it.id AS square_item_id,
    COALESCE(it.image_id, NULLIF(it.item_data->'image_ids'->>0, '')) AS square_image_id,
    it.updated_at,
    it.created_at,
    it.item_data,
    v.value AS variation_obj
  FROM items it
  CROSS JOIN LATERAL jsonb_array_elements(it.item_data->'variations') v(value)
),
rows AS (
  SELECT
    (variation_obj->>'id')::text                                          AS square_variation_id,
    square_item_id                                                        AS square_item_id,
    (item_data->>'name')::text                                            AS name,
    (variation_obj->'item_variation_data'->>'name')::text                 AS variation_name,
    NULLIF(COALESCE(item_data->>'description_plaintext', item_data->>'description', item_data->>'description_html'), '')::text
                                                                          AS description,
    NULLIF(variation_obj->'item_variation_data'->'price_money'->>'amount','')::bigint
                                                                          AS price_cents,
    COALESCE(
      NULLIF(item_data->>'category_id', ''),
      NULLIF(item_data->'reporting_category'->>'id', ''),
      NULLIF(item_data->'categories'->0->>'id', '')
    )                                                                     AS category,
    COALESCE(
      NULLIF(item_data->'reporting_category'->>'id', ''),
      NULLIF(item_data->>'category_id', ''),
      NULLIF(item_data->'categories'->0->>'id', '')
    )                                                                     AS reporting_category,
    COALESCE(
      (
        SELECT array_agg(NULLIF(c->>'id','')::text)
        FROM jsonb_array_elements(item_data->'categories') AS c
        WHERE NULLIF(c->>'id','') IS NOT NULL
      )::text[],
      CASE
        WHEN COALESCE(
          NULLIF(item_data->'reporting_category'->>'id', ''),
          NULLIF(item_data->>'category_id', ''),
          NULLIF(item_data->'categories'->0->>'id', '')
        ) IS NOT NULL
        THEN ARRAY[
          COALESCE(
            NULLIF(item_data->'reporting_category'->>'id', ''),
            NULLIF(item_data->>'category_id', ''),
            NULLIF(item_data->'categories'->0->>'id', '')
          )::text
        ]::text[]
        ELSE NULL::text[]
      END
    )                                                                     AS all_categories,
    square_image_id                                                       AS square_image_id,
    0::int                                                                AS stock_count,
    updated_at                                                            AS updated_at,
    created_at                                                            AS created_at,
    now()                                                                 AS synced_at
  FROM variations
  WHERE variation_obj->>'type' = 'ITEM_VARIATION'
),
upsert AS (
  INSERT INTO products (
    square_variation_id,
    square_item_id,
    name,
    variation_name,
    description,
    price_cents,
    category,
    reporting_category,
    all_categories,
    square_image_id,
    stock_count,
    updated_at,
    created_at,
    synced_at
  )
  SELECT
    square_variation_id,
    square_item_id,
    name,
    variation_name,
    description,
    price_cents,
    category,
    reporting_category,
    all_categories,
    square_image_id,
    stock_count,
    updated_at,
    created_at,
    synced_at
  FROM rows
  WHERE square_variation_id IS NOT NULL
  ON CONFLICT (square_variation_id) DO UPDATE
  SET
    square_item_id       = EXCLUDED.square_item_id,
    name                 = EXCLUDED.name,
    variation_name       = EXCLUDED.variation_name,
    description          = EXCLUDED.description,
    price_cents          = EXCLUDED.price_cents,
    category             = COALESCE(EXCLUDED.category, products.category),
    reporting_category   = COALESCE(EXCLUDED.reporting_category, products.reporting_category),
    all_categories       = COALESCE(EXCLUDED.all_categories, products.all_categories),
    square_image_id      = EXCLUDED.square_image_id,
    -- Never clobber inventory counts during catalog upserts.
    -- Inventory is refreshed separately via /v2/inventory/counts/batch-retrieve.
    stock_count          = products.stock_count,
    updated_at           = EXCLUDED.updated_at,
    synced_at            = EXCLUDED.synced_at
  RETURNING (xmax = 0) AS inserted
)
SELECT
  count(*) FILTER (WHERE inserted)     AS inserted_count,
  count(*) FILTER (WHERE NOT inserted) AS updated_count,
  count(*)                             AS total_upserted
FROM upsert;
`

const SELECT_RECENT_VARIATION_IDS_SQL = `
SELECT square_variation_id
FROM products
WHERE square_variation_id IS NOT NULL
ORDER BY synced_at DESC
LIMIT 1000;
`

const UPDATE_INVENTORY_SQL = `
WITH payload AS (
  SELECT NULLIF(($1), '')::jsonb AS j
),
inventory_counts AS (
  SELECT
    (c->>'catalog_object_id')::text                          AS square_variation_id,
    GREATEST(COALESCE(NULLIF(c->>'quantity','')::int, 0), 0) AS quantity,
    NULLIF(c->>'calculated_at','')::timestamptz              AS updated_at,
    (c->>'location_id')::text                                AS location_id
  FROM payload
  CROSS JOIN LATERAL jsonb_array_elements(j) AS c
  WHERE (c->>'catalog_object_type') = 'ITEM_VARIATION'
    AND (c->>'location_id') = $2
)
UPDATE products p
SET
  stock_count = ic.quantity,
  updated_at  = COALESCE(ic.updated_at, p.updated_at),
  synced_at   = now()
FROM inventory_counts ic
WHERE p.square_variation_id = ic.square_variation_id;
`

const UPDATE_IMAGES_SQL = `
WITH payload AS (
  SELECT NULLIF(($1), '')::jsonb AS j
),
image_mapping AS (
  SELECT
    obj->>'id'                 AS image_id,
    obj->'image_data'->>'url'  AS actual_url
  FROM payload
  CROSS JOIN LATERAL jsonb_array_elements(j) AS obj
  WHERE obj->>'type' = 'IMAGE'
)
UPDATE products p
SET
  image_url = im.actual_url,
  synced_at = now()
FROM image_mapping im
WHERE p.square_image_id = im.image_id;
`

const DENORM_CATEGORIES_SQL = `
UPDATE products p
SET
  category = COALESCE(
    (SELECT name FROM categories WHERE square_category_id = p.reporting_category LIMIT 1),
    p.category
  ),
  all_categories = COALESCE(
    (SELECT array_agg(c.name) FROM categories c WHERE c.square_category_id = ANY(p.all_categories)),
    p.all_categories
  )
WHERE p.all_categories IS NOT NULL;
`

async function syncCategories() {
  let cursor = null
  let processed = 0
  while (true) {
    const payload = await squareFetchJson('/v2/catalog/list', {
      method: 'GET',
      qs: { types: 'CATEGORY', ...(cursor ? { cursor } : {}) },
    })
    const objects = payload.objects || []
    if (objects.length) {
      processed += objects.length
      await query(UPSERT_CATEGORIES_SQL, [JSON.stringify(objects)])
    }
    cursor = payload.cursor || null
    if (!cursor) break
  }
  return processed
}

function extractVariationIdsFromItems(objects) {
  const out = []
  const seen = new Set()
  for (const obj of objects || []) {
    try {
      if (!obj || obj.type !== 'ITEM') continue
      const variations = obj.item_data?.variations || []
      for (const v of variations) {
        if (!v || v.type !== 'ITEM_VARIATION') continue
        const id = v.id
        if (typeof id !== 'string' || !id) continue
        if (seen.has(id)) continue
        seen.add(id)
        out.push(id)
      }
    } catch {
      // ignore bad objects
    }
  }
  return out
}

async function refreshInventoryCountsForVariations(variationIds) {
  const ids = (variationIds || []).filter(Boolean)
  if (!ids.length) return 0

  let totalUpdated = 0
  const CHUNK = 1000

  for (let i = 0; i < ids.length; i += CHUNK) {
    const chunk = ids.slice(i, i + CHUNK)
    const inv = await squareFetchJson('/v2/inventory/counts/batch-retrieve', {
      method: 'POST',
      body: {
        catalog_object_ids: chunk,
        location_ids: [SQUARE_LOCATION_ID],
        states: ['IN_STOCK'],
      },
    })

    const counts = inv.counts || []
    const qtyById = new Map()
    const calcById = new Map()
    for (const c of counts) {
      if (!c || typeof c !== 'object') continue
      const vid = c.catalog_object_id
      if (typeof vid !== 'string' || !vid) continue
      const qRaw = c.quantity
      const qty = Number.isFinite(Number(qRaw)) ? Math.max(0, parseInt(String(qRaw), 10)) : 0
      qtyById.set(vid, qty)
      const calc = c.calculated_at
      if (typeof calc === 'string' && calc) calcById.set(vid, calc)
    }

    // Expand to include missing ids as 0 in-stock.
    const expanded = chunk.map((vid) => ({
      catalog_object_type: 'ITEM_VARIATION',
      catalog_object_id: vid,
      location_id: SQUARE_LOCATION_ID,
      quantity: String(qtyById.get(vid) ?? 0),
      calculated_at: calcById.get(vid) ?? null,
    }))

    const upd = await query(UPDATE_INVENTORY_SQL, [JSON.stringify(expanded), SQUARE_LOCATION_ID])
    totalUpdated += Number(upd.rowCount || 0)
  }

  return totalUpdated
}

async function syncCatalogPages({ cursorStart }) {
  let cursor = cursorStart || null
  let pages = 0
  let inserted = 0
  let updated = 0
  let total = 0
  let inventoryUpdatedRows = 0
  let imageUpdatedRows = 0

  while (pages < MAX_PAGES) {
    const batchObjects = []
    const batchRelated = []
    let batchPages = 0

    while (batchPages < BATCH_PAGES && pages + batchPages < MAX_PAGES) {
      const body = {
        object_types: ['ITEM'],
        include_related_objects: true,
        limit: 100,
        ...(cursor ? { cursor } : {}),
      }
      const payload = await squareFetchJson('/v2/catalog/search', { method: 'POST', body })
      const objects = payload.objects || []
      const related = payload.related_objects || []
      batchObjects.push(...objects)
      batchRelated.push(...related)
      batchPages += 1
      cursor = payload.cursor || null
      if (!cursor) break
    }

    const res = await query(UPSERT_PRODUCTS_SQL, [JSON.stringify(batchObjects)])
    const row = res.rows?.[0] || { inserted_count: 0, updated_count: 0, total_upserted: 0 }
    inserted += Number(row.inserted_count || 0)
    updated += Number(row.updated_count || 0)
    total += Number(row.total_upserted || 0)

    if (batchRelated.length) {
      const upd = await query(UPDATE_IMAGES_SQL, [JSON.stringify(batchRelated)])
      imageUpdatedRows += Number(upd.rowCount || 0)
    }

    // Inventory refresh for variations included in this batch.
    // This prevents "mostly zero stock" because we update the entire catalog over the run
    // (and we explicitly set missing IN_STOCK counts to 0).
    const variationIds = extractVariationIdsFromItems(batchObjects)
    if (variationIds.length) {
      inventoryUpdatedRows += await refreshInventoryCountsForVariations(variationIds)
    }

    pages += batchPages

    // Persist cursor after successful batch
    await setState('catalog_cursor', cursor ? { cursor } : null)

    if (!cursor) break
  }

  // Denormalize category IDs -> names once per run (this is expensive; don't repeat per batch).
  await query(DENORM_CATEGORIES_SQL)

  return { pages, cursor, inserted, updated, total, inventoryUpdatedRows, imageUpdatedRows }
}

export async function webHandler(request) {
  const method = (request.method || 'GET').toUpperCase()
  const userAgent = request.headers.get('user-agent') || ''
  const xVercelCron = request.headers.get('x-vercel-cron')
  const isVercelCron = Boolean(xVercelCron) || /vercel[-\\s]?cron/i.test(userAgent)

  if (method === 'GET') {
    if (process.env.NODE_ENV === 'production' && !isVercelCron) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized. Cron only.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  } else if (method === 'POST') {
    // Optional manual trigger with secret
    const secret = process.env.WEBHOOK_SECRET
    if (process.env.NODE_ENV === 'production' && secret) {
      const provided = request.headers.get('x-webhook-secret') || ''
      if (provided !== secret) {
        return new Response(JSON.stringify({ success: false, error: 'Unauthorized.' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }
  } else {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed. Use GET (cron) or POST.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const startedAt = Date.now()

  try {
    await ensureStateTable()

    // Daily reset
    const today = utcDateStr()
    const lastReset = (await getState('inventory_last_reset_date'))?.date || null
    if (lastReset !== today) {
      await setState('inventory_last_reset_date', { date: today })
      await setState('catalog_cursor', null)
    }

    const cursorState = await getState('catalog_cursor')
    const cursorStart = cursorState?.cursor || null

    const categoriesProcessed = await syncCategories()
    const catalog = await syncCatalogPages({ cursorStart })

    // Rebuild albums_cache so the frontend sees updated products
    const cacheResult = await populateAlbumsCache()

    const durationMs = Date.now() - startedAt

    return new Response(
      JSON.stringify({
        success: true,
        durationMs,
        square: { baseUrl: SQUARE_BASE_URL, version: SQUARE_VERSION, locationId: SQUARE_LOCATION_ID },
        categoriesProcessed,
        catalog: {
          pagesFetched: catalog.pages,
          cursorSaved: Boolean(catalog.cursor),
          inserted: catalog.inserted,
          updated: catalog.updated,
          totalUpserted: catalog.total,
          inventoryRowsUpdated: catalog.inventoryUpdatedRows,
          imageRowsUpdated: catalog.imageUpdatedRows,
        },
        albumsCache: cacheResult,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const durationMs = Date.now() - startedAt
    const msg = error?.message || String(error)
    console.error('[Catalog Sync Nightly] Error:', msg, error?.details || '')

    void sendSlackAlert({
      statusCode: 500,
      error: `[SYNC-CATALOG-NIGHTLY] ${msg}`,
      endpoint: '/api/catalog-sync-nightly',
      method: method,
      context: {
        alertCode: 'SYNC-CATALOG-NIGHTLY',
        durationMs,
        details: error?.details,
      },
      stack: error?.stack,
      dedupeKey: `catalog_sync_nightly:${msg}`,
    })

    return new Response(JSON.stringify({ success: false, error: msg, durationMs }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export default withWebHandler(webHandler)

