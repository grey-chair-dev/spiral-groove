/**
 * Recent Square sales, keyed by catalog variation id.
 *
 * albums_cache is rebuilt from the product catalog, which has no sales history.
 * Staff picks (and Recently Sold) read sold_count / last_sold_at off that cache,
 * so this rollup is applied after every rebuild.
 *
 * Window is the last 30 days of COMPLETED orders. That is recent enough for the
 * weekly staff-picks rotation to move, and wide enough that New Vinyl still
 * has more than four in-stock sellers.
 */

import { getPool, query } from './db.js'

const WINDOW_DAYS = 30
const MAX_PAGES = 20
const PAGE_SIZE = 200

function squareRequestConfig() {
  const token = process.env.SQUARE_ACCESS_TOKEN
  if (!token) throw new Error('Missing env var: SQUARE_ACCESS_TOKEN')

  const env = (process.env.SQUARE_ENVIRONMENT || process.env.SQUARE_ENV || 'production').toLowerCase()
  const base =
    process.env.SQUARE_BASE_URL ||
    (env === 'sandbox' ? 'https://connect.squareupsandbox.com' : 'https://connect.squareup.com')
  const locationId = process.env.SQUARE_LOCATION_ID || 'ATHC6TCDTCHWN'
  const version = process.env.SQUARE_VERSION || '2025-10-16'

  return { token, base, locationId, version }
}

export async function ensureAlbumSalesSchema() {
  await query(`
    CREATE TABLE IF NOT EXISTS album_sales (
      square_variation_id TEXT PRIMARY KEY,
      sold_count INTEGER NOT NULL DEFAULT 0,
      last_sold_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
}

/**
 * Sum completed-order quantities for the last 30 days.
 * @returns {Promise<{ orders: number, counts: Map<string, { qty: number, lastSoldAt: string }> }>}
 */
async function fetchRecentSquareSales() {
  const { token, base, locationId, version } = squareRequestConfig()
  const startAt = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString()
  const endAt = new Date().toISOString()

  /** @type {Map<string, { qty: number, lastSoldAt: string }>} */
  const counts = new Map()
  let orders = 0
  let cursor
  let pages = 0

  while (pages < MAX_PAGES) {
    const body = {
      location_ids: [locationId],
      limit: PAGE_SIZE,
      query: {
        filter: {
          state_filter: { states: ['COMPLETED'] },
          date_time_filter: { closed_at: { start_at: startAt, end_at: endAt } },
        },
        sort: { sort_field: 'CLOSED_AT', sort_order: 'DESC' },
      },
    }
    if (cursor) body.cursor = cursor

    const res = await fetch(`${base}/v2/orders/search`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Square-Version': version,
      },
      body: JSON.stringify(body),
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      const detail = json?.errors?.[0]?.detail || json?.errors?.[0]?.code || res.status
      throw new Error(`Square orders search failed: ${detail}`)
    }

    pages += 1
    const batch = Array.isArray(json.orders) ? json.orders : []
    orders += batch.length

    for (const order of batch) {
      const closedAt = order.closed_at || order.created_at || endAt
      for (const line of order.line_items || []) {
        const variationId = line.catalog_object_id
        if (!variationId) continue
        const qty = Number(line.quantity)
        if (!Number.isFinite(qty) || qty <= 0) continue
        const prev = counts.get(variationId)
        if (!prev) {
          counts.set(variationId, { qty, lastSoldAt: closedAt })
          continue
        }
        prev.qty += qty
        if (closedAt > prev.lastSoldAt) prev.lastSoldAt = closedAt
      }
    }

    cursor = json.cursor
    if (!cursor || batch.length === 0) break
  }

  return { orders, counts }
}

/**
 * Replace album_sales with a fresh 30-day Square rollup.
 * A zero-order response is treated as a failed pull so a bad filter cannot wipe the last good counts.
 */
export async function refreshAlbumSales() {
  await ensureAlbumSalesSchema()
  const { orders, counts } = await fetchRecentSquareSales()

  if (orders === 0 || counts.size === 0) {
    console.warn('[Album Sales] Square returned no completed orders; keeping previous album_sales')
    return { orders, variations: 0, replaced: false, windowDays: WINDOW_DAYS }
  }

  const ids = []
  const qtys = []
  const lasts = []
  for (const [id, row] of counts) {
    ids.push(id)
    qtys.push(Math.round(row.qty))
    lasts.push(row.lastSoldAt)
  }

  const client = await getPool().connect()
  try {
    await client.query('BEGIN')
    await client.query('DELETE FROM album_sales')
    await client.query(
      `
      INSERT INTO album_sales (square_variation_id, sold_count, last_sold_at, updated_at)
      SELECT u.id, u.qty, u.last_sold, NOW()
      FROM unnest($1::text[], $2::int[], $3::timestamptz[]) AS u(id, qty, last_sold)
      `,
      [ids, qtys, lasts],
    )
    await client.query('COMMIT')
  } catch (error) {
    try {
      await client.query('ROLLBACK')
    } catch {
      // ignore rollback failure; the original error is the one to surface
    }
    throw error
  } finally {
    client.release()
  }

  console.log(`[Album Sales] Stored ${counts.size} variations from ${orders} orders (last ${WINDOW_DAYS} days)`)
  return { orders, variations: counts.size, replaced: true, windowDays: WINDOW_DAYS }
}

/**
 * Copy album_sales onto albums_cache. Safe to run after a cache rebuild that zeroed sold_count.
 * @returns {Promise<number>} rows whose sold_count was set from the rollup
 */
export async function applyAlbumSalesToAlbumsCache() {
  await ensureAlbumSalesSchema()

  await query(`
    UPDATE albums_cache ac
    SET sold_count = 0,
        last_sold_at = NULL
    WHERE ac.sold_count <> 0
      AND NOT EXISTS (
        SELECT 1 FROM album_sales s WHERE s.square_variation_id = ac.square_variation_id
      )
  `)

  const updated = await query(`
    UPDATE albums_cache ac
    SET sold_count = s.sold_count,
        last_sold_at = s.last_sold_at
    FROM album_sales s
    WHERE ac.square_variation_id = s.square_variation_id
      AND (
        ac.sold_count IS DISTINCT FROM s.sold_count
        OR ac.last_sold_at IS DISTINCT FROM s.last_sold_at
      )
  `)

  return updated.rowCount || 0
}
