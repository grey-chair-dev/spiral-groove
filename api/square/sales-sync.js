import { withWebHandler } from '../_vercelNodeAdapter.js'
import { createRequire } from 'module'
import { query } from '../db.js'

const require = createRequire(import.meta.url)
const { SquareClient, SquareEnvironment } = require('square')

export const config = {
  runtime: 'nodejs',
}

function getSquareEnv() {
  const env = (process.env.SQUARE_ENVIRONMENT || (process.env.NODE_ENV === 'production' ? 'production' : 'sandbox')).toLowerCase()
  return env === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox
}

function parseISOish(value) {
  const s = (value || '').trim()
  if (!s) return null
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

function coerceInt(value, fallback = 0) {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.trunc(n)
}

function getOrdersFromResponse(resp) {
  const orders =
    resp?.orders ||
    resp?.response?.orders ||
    resp?.result?.orders ||
    resp?.data?.orders ||
    []
  const cursor =
    resp?.cursor ||
    resp?.response?.cursor ||
    resp?.result?.cursor ||
    resp?.data?.cursor ||
    null
  return { orders: Array.isArray(orders) ? orders : [], cursor: cursor || null }
}

function safeJsonStringify(value) {
  try {
    return JSON.stringify(value, (_k, v) => (typeof v === 'bigint' ? v.toString() : v))
  } catch {
    // Best-effort: don't fail ingestion if raw payload can't be serialized.
    return null
  }
}

async function ensureSalesSchema() {
  await query(
    `CREATE TABLE IF NOT EXISTS sales_orders (
      square_order_id TEXT PRIMARY KEY,
      location_id TEXT,
      state TEXT,
      customer_id TEXT,
      source TEXT,
      currency TEXT,
      total_money BIGINT,
      total_tax_money BIGINT,
      total_discount_money BIGINT,
      total_tip_money BIGINT,
      created_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ,
      closed_at TIMESTAMPTZ,
      raw JSONB,
      ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
  )

  await query(`CREATE INDEX IF NOT EXISTS sales_orders_created_at_idx ON sales_orders (created_at DESC)`)

  await query(
    `CREATE TABLE IF NOT EXISTS sales_line_items (
      id BIGSERIAL PRIMARY KEY,
      square_order_id TEXT NOT NULL REFERENCES sales_orders(square_order_id) ON DELETE CASCADE,
      square_line_item_uid TEXT NOT NULL,
      square_catalog_object_id TEXT,
      name TEXT,
      quantity INTEGER NOT NULL DEFAULT 0,
      currency TEXT,
      gross_sales_money BIGINT,
      total_money BIGINT,
      order_created_at TIMESTAMPTZ,
      order_closed_at TIMESTAMPTZ,
      raw JSONB,
      ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(square_order_id, square_line_item_uid)
    )`,
  )

  await query(`CREATE INDEX IF NOT EXISTS sales_line_items_catalog_object_idx ON sales_line_items (square_catalog_object_id)`)
  await query(`CREATE INDEX IF NOT EXISTS sales_line_items_order_created_at_idx ON sales_line_items (order_created_at DESC)`)

  await query(
    `CREATE TABLE IF NOT EXISTS sales_sync_state (
      key TEXT PRIMARY KEY,
      last_synced_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
  )
}

async function upsertOrders(orders) {
  if (!orders.length) return
  const params = []
  const rows = []
  let i = 1
  for (const o of orders) {
    const id = String(o?.id || '')
    if (!id) continue
    const locationId = o?.locationId ? String(o.locationId) : null
    const state = o?.state ? String(o.state) : null
    const customerId = o?.customerId ? String(o.customerId) : null
    const source = o?.source ? String(o.source) : null
    const currency = o?.totalMoney?.currency || o?.netAmountDueMoney?.currency || null
    const totalMoney = o?.totalMoney?.amount != null ? BigInt(String(o.totalMoney.amount)) : null
    const totalTaxMoney = o?.totalTaxMoney?.amount != null ? BigInt(String(o.totalTaxMoney.amount)) : null
    const totalDiscountMoney = o?.totalDiscountMoney?.amount != null ? BigInt(String(o.totalDiscountMoney.amount)) : null
    const totalTipMoney = o?.totalTipMoney?.amount != null ? BigInt(String(o.totalTipMoney.amount)) : null
    const createdAt = parseISOish(o?.createdAt)
    const updatedAt = parseISOish(o?.updatedAt)
    const closedAt = parseISOish(o?.closedAt)
    const raw = o ? safeJsonStringify(o) : null

    params.push(
      id,
      locationId,
      state,
      customerId,
      source,
      currency,
      totalMoney,
      totalTaxMoney,
      totalDiscountMoney,
      totalTipMoney,
      createdAt,
      updatedAt,
      closedAt,
      raw,
    )

    rows.push(
      `($${i++}::text,$${i++}::text,$${i++}::text,$${i++}::text,$${i++}::text,$${i++}::text,$${i++}::bigint,$${i++}::bigint,$${i++}::bigint,$${i++}::bigint,$${i++}::timestamptz,$${i++}::timestamptz,$${i++}::timestamptz,$${i++}::jsonb)`,
    )
  }

  if (!rows.length) return

  await query(
    `INSERT INTO sales_orders (
      square_order_id, location_id, state, customer_id, source, currency,
      total_money, total_tax_money, total_discount_money, total_tip_money,
      created_at, updated_at, closed_at, raw
    )
    VALUES ${rows.join(',')}
    ON CONFLICT (square_order_id) DO UPDATE SET
      location_id = EXCLUDED.location_id,
      state = EXCLUDED.state,
      customer_id = EXCLUDED.customer_id,
      source = EXCLUDED.source,
      currency = EXCLUDED.currency,
      total_money = EXCLUDED.total_money,
      total_tax_money = EXCLUDED.total_tax_money,
      total_discount_money = EXCLUDED.total_discount_money,
      total_tip_money = EXCLUDED.total_tip_money,
      created_at = COALESCE(EXCLUDED.created_at, sales_orders.created_at),
      updated_at = COALESCE(EXCLUDED.updated_at, sales_orders.updated_at),
      closed_at = COALESCE(EXCLUDED.closed_at, sales_orders.closed_at),
      raw = EXCLUDED.raw,
      ingested_at = NOW()`,
    params,
  )
}

async function insertLineItems(orders) {
  const lineRows = []
  const params = []
  let i = 1

  for (const o of orders) {
    const orderId = String(o?.id || '')
    if (!orderId) continue
    const orderCreatedAt = parseISOish(o?.createdAt)
    const orderClosedAt = parseISOish(o?.closedAt)
    const currency = o?.totalMoney?.currency || o?.netAmountDueMoney?.currency || null
    const items = Array.isArray(o?.lineItems) ? o.lineItems : []
    for (const li of items) {
      const uid = String(li?.uid || li?.uid || '')
      if (!uid) continue
      const catalogObjectId = li?.catalogObjectId ? String(li.catalogObjectId) : null
      const name = li?.name ? String(li.name) : null
      // quantities come back as strings (can be "1", "2", "0.5")
      const qty = coerceInt(li?.quantity, 0)
      const gross = li?.grossSalesMoney?.amount != null ? BigInt(String(li.grossSalesMoney.amount)) : null
      const total = li?.totalMoney?.amount != null ? BigInt(String(li.totalMoney.amount)) : null
      const raw = li ? safeJsonStringify(li) : null

      params.push(orderId, uid, catalogObjectId, name, qty, currency, gross, total, orderCreatedAt, orderClosedAt, raw)
      lineRows.push(
        `($${i++}::text,$${i++}::text,$${i++}::text,$${i++}::text,$${i++}::int,$${i++}::text,$${i++}::bigint,$${i++}::bigint,$${i++}::timestamptz,$${i++}::timestamptz,$${i++}::jsonb)`,
      )
    }
  }

  if (!lineRows.length) return { inserted: [], insertedCount: 0 }

  // Avoid giant VALUES in one query
  const CHUNK_SIZE = 400 // line items
  const inserted = []
  let offset = 0
  let insertedCount = 0

  while (offset < lineRows.length) {
    const chunkRows = lineRows.slice(offset, offset + CHUNK_SIZE)
    const chunkParams = params.slice(offset * 11, (offset + chunkRows.length) * 11)

    // Re-number placeholders for the chunk
    // (Simplest: rebuild the rows for this chunk)
    const rebuiltRows = []
    let p = 1
    for (let r = 0; r < chunkRows.length; r++) {
      rebuiltRows.push(
        `($${p++}::text,$${p++}::text,$${p++}::text,$${p++}::text,$${p++}::int,$${p++}::text,$${p++}::bigint,$${p++}::bigint,$${p++}::timestamptz,$${p++}::timestamptz,$${p++}::jsonb)`,
      )
    }

    const res = await query(
      `INSERT INTO sales_line_items (
        square_order_id, square_line_item_uid, square_catalog_object_id, name,
        quantity, currency, gross_sales_money, total_money,
        order_created_at, order_closed_at, raw
      )
      VALUES ${rebuiltRows.join(',')}
      ON CONFLICT (square_order_id, square_line_item_uid) DO NOTHING
      RETURNING square_catalog_object_id, quantity, order_created_at`,
      chunkParams,
    )
    insertedCount += res.rows.length
    inserted.push(...res.rows)
    offset += CHUNK_SIZE
  }

  return { inserted, insertedCount }
}

async function incrementProductSoldCountsFromInserted(insertedRows) {
  if (!Array.isArray(insertedRows) || insertedRows.length === 0) return

  const qtyByProductId = new Map()
  const soldAtByProductId = new Map()

  for (const row of insertedRows) {
    const variationId = String(row?.square_catalog_object_id || '').trim()
    if (!variationId) continue
    const productId = variationId.startsWith('variation-') ? variationId : `variation-${variationId}`
    const qty = Number(row?.quantity || 0)
    if (!Number.isFinite(qty) || qty <= 0) continue

    qtyByProductId.set(productId, (qtyByProductId.get(productId) || 0) + qty)

    const soldAt = row?.order_created_at ? new Date(row.order_created_at) : null
    if (soldAt && !Number.isNaN(soldAt.getTime())) {
      const prev = soldAtByProductId.get(productId)
      if (!prev || soldAt.getTime() > prev.getTime()) soldAtByProductId.set(productId, soldAt)
    }
  }

  if (qtyByProductId.size === 0) return

  const tuples = []
  const params = []
  let i = 1
  for (const [id, qty] of qtyByProductId.entries()) {
    const soldAt = soldAtByProductId.get(id) || null
    params.push(String(id), Number(qty), soldAt ? soldAt.toISOString() : null)
    tuples.push(`($${i++}::text,$${i++}::int,$${i++}::timestamptz)`)
  }

  await query(
    `UPDATE products_cache pc
     SET sold_count = COALESCE(pc.sold_count, 0) + v.qty,
         last_sold_at = CASE
           WHEN v.sold_at IS NULL THEN pc.last_sold_at
           WHEN pc.last_sold_at IS NULL THEN v.sold_at
           ELSE GREATEST(pc.last_sold_at, v.sold_at)
         END
     FROM (VALUES ${tuples.join(',')}) AS v(id, qty, sold_at)
     WHERE pc.id = v.id`,
    params,
  )
}

async function readLastSyncedAt() {
  const res = await query(`SELECT last_synced_at FROM sales_sync_state WHERE key='square_orders' LIMIT 1`)
  const raw = res.rows?.[0]?.last_synced_at
  return raw ? new Date(raw) : null
}

async function writeLastSyncedAt(ts) {
  await query(
    `INSERT INTO sales_sync_state (key, last_synced_at)
     VALUES ('square_orders', $1::timestamptz)
     ON CONFLICT (key) DO UPDATE SET last_synced_at=EXCLUDED.last_synced_at, updated_at=NOW()`,
    [ts.toISOString()],
  )
}

/**
 * GET /api/square/sales-sync
 *   - Intended for Vercel cron: sync last 24h of Square orders into Neon.
 * POST /api/square/sales-sync
 *   - Admin-triggered backfill. Body:
 *     { startAt?: ISO, endAt?: ISO, limit?: number, maxPages?: number }
 */
export async function webHandler(request) {
  const method = (request.method || 'GET').toUpperCase()

  const userAgent = request.headers.get('user-agent') || ''
  const xVercelCron = request.headers.get('x-vercel-cron')
  const isVercelCron = Boolean(xVercelCron) || /vercel[-\s]?cron/i.test(userAgent)

  if (method === 'GET') {
    if (process.env.NODE_ENV === 'production' && !isVercelCron) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  } else if (method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const webhookSecret = request.headers.get('x-webhook-secret')
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.WEBHOOK_SECRET &&
    !isVercelCron &&
    webhookSecret !== process.env.WEBHOOK_SECRET
  ) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized. Invalid webhook secret.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const startedAt = Date.now()
  let syncLogId = null
  
  try {
    await ensureSalesSchema()

    // Log sync start
    try {
      const logResult = await query(`
        INSERT INTO sync_log (sync_type, status, started_at, metadata)
        VALUES ('sales', 'running', NOW(), $1::jsonb)
        RETURNING id
      `, [JSON.stringify({ 
        method, 
        isVercelCron,
        userAgent: userAgent.substring(0, 100)
      })])
      syncLogId = logResult.rows[0]?.id
    } catch (logError) {
      console.warn('[Sales Sync] Failed to log start:', logError.message)
    }

    const accessToken = process.env.SQUARE_ACCESS_TOKEN
    const locationId = process.env.SQUARE_LOCATION_ID
    if (!accessToken) throw new Error('Missing SQUARE_ACCESS_TOKEN')
    if (!locationId) throw new Error('Missing SQUARE_LOCATION_ID')

    const client = new SquareClient({ token: accessToken, environment: getSquareEnv() })

    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const body = method === 'POST' ? await request.json() : {}
    const limit = body?.limit != null ? Math.max(1, Math.min(500, Number(body.limit))) : 100
    const maxPages = body?.maxPages != null ? Math.max(1, Math.min(5000, Number(body.maxPages))) : 250

    let startAt = parseISOish(body?.startAt)
    let endAt = parseISOish(body?.endAt)

    if (method === 'GET') {
      // Cron: incremental
      startAt = oneDayAgo.toISOString()
      endAt = now.toISOString()
    } else {
      // Admin backfill: default from last synced (if any), else 365 days
      if (!endAt) endAt = now.toISOString()
      if (!startAt) {
        const last = await readLastSyncedAt()
        if (last) {
          // overlap window to catch late updates
          const overlap = new Date(last.getTime() - 2 * 60 * 60 * 1000)
          startAt = overlap.toISOString()
        } else {
          startAt = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString()
        }
      }
    }

    let cursor = null
    let pages = 0
    let totalOrders = 0
    let insertedLineItems = 0
    let latestCreatedAt = null

    while (pages < maxPages) {
      const resp = await client.orders.search({
        locationIds: [locationId],
        limit,
        cursor: cursor || undefined,
        query: {
          filter: {
            dateTimeFilter: {
              createdAt: { startAt, endAt },
            },
          },
          sort: { sortField: 'CREATED_AT', sortOrder: 'ASC' },
        },
      })

      const { orders, cursor: nextCursor } = getOrdersFromResponse(resp)
      pages += 1
      if (!orders.length) break

      totalOrders += orders.length
      await upsertOrders(orders)
      const inserted = await insertLineItems(orders)
      insertedLineItems += inserted.insertedCount
      await incrementProductSoldCountsFromInserted(inserted.inserted)

      for (const o of orders) {
        const created = parseISOish(o?.createdAt)
        if (created) latestCreatedAt = created
      }

      cursor = nextCursor
      if (!cursor) break
    }

    if (latestCreatedAt) {
      await writeLastSyncedAt(new Date(latestCreatedAt))
    }

    const durationMs = Date.now() - startedAt
    
    // Log sync success
    if (syncLogId) {
      try {
        await query(`
          UPDATE sync_log 
          SET status = 'success',
              completed_at = NOW(),
              duration_ms = $1,
              items_processed = $2,
              items_created = $3,
              metadata = COALESCE(metadata, '{}'::jsonb) || $4::jsonb
          WHERE id = $5
        `, [
          durationMs,
          totalOrders,
          insertedLineItems,
          JSON.stringify({ 
            range: { startAt, endAt },
            pages,
            lastSyncedAt: latestCreatedAt
          }),
          syncLogId
        ])
      } catch (logError) {
        console.warn('[Sales Sync] Failed to log success:', logError.message)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        range: { startAt, endAt },
        pages,
        orders: totalOrders,
        insertedLineItems,
        lastSyncedAt: latestCreatedAt,
        syncLogId,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } },
    )
  } catch (e) {
    const durationMs = Date.now() - startedAt
    const errorMessage = e?.message || 'Sales sync failed'
    
    // Log sync error
    if (syncLogId) {
      try {
        await query(`
          UPDATE sync_log 
          SET status = 'error',
              completed_at = NOW(),
              duration_ms = $1,
              error_message = $2
          WHERE id = $3
        `, [durationMs, errorMessage.substring(0, 1000), syncLogId])
      } catch (logError) {
        console.warn('[Sales Sync] Failed to log error:', logError.message)
      }
    }
    
    return new Response(JSON.stringify({ success: false, error: errorMessage, syncLogId }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }
}

export default withWebHandler(webHandler)

