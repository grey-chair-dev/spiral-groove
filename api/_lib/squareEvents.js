/**
 * Square webhook event handlers (replace Make's "Inventory Count" and "Order Status Updates").
 * Pure functions over an injected `query` / `updateOrderStatus`, so they can be tested without a DB.
 */

function str(v) {
  return v == null ? '' : String(v)
}

function num(v) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

/**
 * inventory.count.updated: log the change in `inventory` and set albums_cache.stock_count.
 * Square sends one count per state; only IN_STOCK is the shelf quantity.
 * (The nightly catalog sync rebuilds albums_cache from Square anyway; this keeps stock live in between.)
 */
export async function handleInventoryCountUpdated(event, { query }) {
  const counts = event?.data?.object?.inventory_counts ?? []
  const createdAt = str(event?.created_at) || new Date().toISOString()
  const results = []
  for (const c of counts) {
    if (str(c?.state) !== 'IN_STOCK' || !c?.catalog_object_id) continue
    const variationId = str(c.catalog_object_id)
    const found = await query(
      `SELECT p.stock_count AS product_count, ac.stock_count AS cache_count
         FROM products p
         LEFT JOIN albums_cache ac ON ac.square_variation_id = p.square_variation_id
        WHERE p.square_variation_id = $1
        LIMIT 1`,
      [variationId],
    )
    const row = found.rows[0]
    if (!row) {
      results.push(`${variationId}: not in products`)
      continue
    }
    const newQty = Math.round(num(c.quantity))
    // Compare with the live cached count when there is one, so several changes in a day log correctly
    // (products.stock_count is only refreshed by the nightly sync). Make used products.stock_count.
    const previous = row.cache_count != null ? num(row.cache_count) : num(row.product_count)
    const change = Math.round(newQty - previous)
    await query(
      `INSERT INTO inventory (square_variation_id, quantity_change, reason, notes, created_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        variationId,
        change,
        str(event?.type),
        `Square webhook: IN_STOCK state. Previous: ${previous}, New: ${newQty} (change: ${change})`,
        createdAt,
      ],
    )
    await query(
      `UPDATE albums_cache SET stock_count = $1, updated_at = $2 WHERE square_variation_id = $3`,
      [newQty, createdAt, variationId],
    )
    results.push(`${variationId}: ${change >= 0 ? '+' : ''}${change}`)
  }
  return { ok: true, results }
}

/**
 * order.fulfillment.updated: store the new fulfillment state and email the customer.
 * RESERVED is only stored (no email), like the Make scenario. Other states go through
 * updateOrderStatus(), which normalizes, skips unchanged statuses and sends the email.
 */
export async function handleOrderFulfillmentUpdated(event, { query, updateOrderStatus }) {
  const upd = event?.data?.object?.order_fulfillment_updated
  const orderId = str(upd?.order_id)
  const newState = str(upd?.fulfillment_update?.[0]?.new_state)
  if (!orderId || !newState) return { ok: true, skipped: 'not a fulfillment update' }

  if (newState === 'RESERVED') {
    const r = await query(
      `UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE square_order_id = $2`,
      [newState, orderId],
    )
    return { ok: true, status: newState, updated: r.rowCount ?? 0, email: false }
  }

  const res = await updateOrderStatus({ square_order_id: orderId, status: newState, fulfillment_state: newState })
  if (res.status === 404) return { ok: true, skipped: 'order not in db' }
  const body = await res.json().catch(() => ({}))
  if (!res.ok) return { ok: false, error: body?.error || `updateOrderStatus returned ${res.status}` }
  return { ok: true, status: body?.order?.status ?? newState, email: body?.email ?? null }
}

export const HANDLERS = {
  'inventory.count.updated': handleInventoryCountUpdated,
  'order.fulfillment.updated': handleOrderFulfillmentUpdated,
}
