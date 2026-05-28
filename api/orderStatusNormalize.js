/**
 * Normalizes Square / Make.com order status payloads before writing to Neon.
 *
 * Common bug: Square activity "marked as Ready" forwarded as COMPLETED, which shows
 * "Picked up" on the site and skips the ready-for-pickup email.
 */

const READY_STATUSES = new Set([
  'PREPARED',
  'READY',
  'READY_FOR_PICKUP',
  'MARKED_READY',
  'ITEM_READY',
])

const COMPLETE_STATUSES = new Set([
  'COMPLETED',
  'PICKED_UP',
  'DELIVERED',
  'FULFILLED',
])

const IN_PROGRESS_STATUSES = new Set(['PROPOSED', 'OPEN', 'DRAFT', 'RESERVED'])

function upper(value) {
  return String(value ?? '').trim().toUpperCase()
}

function eventIndicatesReady(body) {
  const event = String(body?.event_type || body?.eventType || body?.square_event || body?.activity || '')
    .trim()
    .toLowerCase()
  if (!event) return false
  if (event.includes('picked') || event.includes('complete') || event.includes('fulfilled')) {
    return false
  }
  return event.includes('ready') || event.includes('prepared')
}

function isPickupOrder(body, order) {
  const fromBody = upper(body?.delivery_method || body?.deliveryMethod)
  if (fromBody === 'PICKUP') return true
  if (fromBody === 'DELIVERY' || fromBody === 'SHIPMENT' || fromBody === 'SHIP') return false

  const pickup = order?.pickup_details || body?.pickup_details || {}
  const method = upper(pickup?.deliveryMethod || pickup?.delivery_method)
  if (method === 'PICKUP') return true
  if (method === 'DELIVERY') return false

  const hasShipAddress = Boolean(pickup?.address && (pickup?.city || pickup?.zipCode))
  return !hasShipAddress
}

/**
 * @param {Record<string, unknown>} body - Webhook JSON body
 * @param {{ pickup_details?: Record<string, unknown>, delivery_method?: string, status?: string }} [order] - Existing DB row when available
 * @returns {{ status: string, rawStatus: string, reason: string }}
 */
export function normalizeOrderStatus(body, order = null) {
  const rawStatus = String(body?.status || body?.state || '').trim()
  const rawUpper = upper(rawStatus)
  const fulfillmentUpper = upper(
    body?.fulfillment_state ||
      body?.fulfillmentState ||
      body?.square_fulfillment_state ||
      body?.squareFulfillmentState,
  )

  if (eventIndicatesReady(body)) {
    return { status: 'PREPARED', rawStatus, reason: 'event_ready' }
  }

  if (READY_STATUSES.has(fulfillmentUpper)) {
    return { status: 'PREPARED', rawStatus, reason: 'fulfillment_ready' }
  }

  if (READY_STATUSES.has(rawUpper)) {
    return { status: 'PREPARED', rawStatus, reason: 'status_ready_alias' }
  }

  // Pickup orders: do not accept COMPLETED unless fulfillment is explicitly complete.
  if (
    isPickupOrder(body, order) &&
    COMPLETE_STATUSES.has(rawUpper) &&
    !COMPLETE_STATUSES.has(fulfillmentUpper)
  ) {
    return { status: 'PREPARED', rawStatus, reason: 'pickup_completed_guard' }
  }

  if (COMPLETE_STATUSES.has(rawUpper)) {
    return { status: 'COMPLETED', rawStatus, reason: 'completed' }
  }

  if (rawUpper === 'CANCELLED') {
    return { status: 'CANCELED', rawStatus, reason: 'canceled_spelling' }
  }

  if (IN_PROGRESS_STATUSES.has(rawUpper)) {
    return { status: rawUpper === 'OPEN' || rawUpper === 'DRAFT' ? 'PROPOSED' : rawUpper, rawStatus, reason: 'in_progress' }
  }

  if (rawUpper === 'SHIPPED') {
    return { status: 'SHIPPED', rawStatus, reason: 'shipped' }
  }

  if (rawUpper) {
    return { status: rawUpper, rawStatus, reason: 'passthrough' }
  }

  return { status: 'PROPOSED', rawStatus, reason: 'default' }
}

function parsePickupDetails(raw) {
  if (!raw) return {}
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw)
    } catch {
      return {}
    }
  }
  return raw
}

function resolveDeliveryMethod(orderRow, squareOrder) {
  const pickup = parsePickupDetails(orderRow?.pickup_details)
  const fromRow = upper(orderRow?.delivery_method)
  if (fromRow === 'DELIVERY' || fromRow === 'SHIPMENT') return 'delivery'
  if (fromRow === 'PICKUP') return 'pickup'

  const fromPickup = upper(pickup?.deliveryMethod || pickup?.delivery_method)
  if (fromPickup === 'DELIVERY') return 'delivery'
  if (fromPickup === 'PICKUP') return 'pickup'
  if (pickup?.address && (pickup?.city || pickup?.zipCode)) return 'delivery'

  const fulfillments = Array.isArray(squareOrder?.fulfillments) ? squareOrder.fulfillments : []
  if (fulfillments.some((f) => upper(f?.type) === 'SHIPMENT')) return 'delivery'
  return 'pickup'
}

function pickFulfillment(fulfillments, deliveryMethod) {
  if (!fulfillments.length) return null
  const want = deliveryMethod === 'delivery' ? 'SHIPMENT' : 'PICKUP'
  return (
    fulfillments.find((f) => upper(f?.type) === want) ||
    fulfillments[0]
  )
}

/**
 * Derive Neon `orders.status` from a Square Orders API order object.
 * Uses fulfillment state (not order.state) for pickup — order.state can be COMPLETED when paid.
 *
 * @param {Record<string, unknown>} squareOrder
 * @param {{ delivery_method?: string, pickup_details?: unknown }} [orderRow]
 * @returns {{ status: string, fulfillmentState: string | null, deliveryMethod: string, source: string }}
 */
export function deriveStatusFromSquareOrder(squareOrder, orderRow = null) {
  const deliveryMethod = resolveDeliveryMethod(orderRow, squareOrder)
  const orderState = upper(squareOrder?.state)
  const fulfillments = Array.isArray(squareOrder?.fulfillments) ? squareOrder.fulfillments : []
  const fulfillment = pickFulfillment(fulfillments, deliveryMethod)
  const fState = upper(fulfillment?.state)

  if (orderState === 'CANCELED' || orderState === 'CANCELLED' || fState === 'CANCELED' || fState === 'CANCELLED') {
    return { status: 'CANCELED', fulfillmentState: fState || orderState, deliveryMethod, source: 'canceled' }
  }

  if (fState === 'FAILED') {
    return { status: 'CANCELED', fulfillmentState: fState, deliveryMethod, source: 'fulfillment_failed' }
  }

  if (deliveryMethod === 'delivery') {
    if (fState === 'COMPLETED') {
      return { status: 'COMPLETED', fulfillmentState: fState, deliveryMethod, source: 'shipment_delivered' }
    }
    if (fState === 'PREPARED' || fState === 'RESERVED') {
      return { status: 'SHIPPED', fulfillmentState: fState, deliveryMethod, source: 'shipment_in_transit' }
    }
    return { status: 'PROPOSED', fulfillmentState: fState || null, deliveryMethod, source: 'shipment_proposed' }
  }

  // In-store pickup: fulfillment state is canonical.
  if (fState === 'COMPLETED') {
    return { status: 'COMPLETED', fulfillmentState: fState, deliveryMethod, source: 'pickup_completed' }
  }
  if (fState === 'PREPARED') {
    return { status: 'PREPARED', fulfillmentState: fState, deliveryMethod, source: 'pickup_ready' }
  }
  if (fState === 'RESERVED') {
    return { status: 'RESERVED', fulfillmentState: fState, deliveryMethod, source: 'pickup_reserved' }
  }
  if (fState === 'PROPOSED') {
    return { status: 'PROPOSED', fulfillmentState: fState, deliveryMethod, source: 'pickup_proposed' }
  }

  // No fulfillment on older rows: infer from order.state cautiously.
  if (orderState === 'COMPLETED') {
    return { status: 'PROPOSED', fulfillmentState: null, deliveryMethod, source: 'order_completed_no_fulfillment' }
  }
  if (orderState === 'OPEN' || orderState === 'DRAFT') {
    return { status: 'PROPOSED', fulfillmentState: null, deliveryMethod, source: 'order_open' }
  }

  return { status: 'PROPOSED', fulfillmentState: null, deliveryMethod, source: 'default' }
}

/** @returns {boolean} */
export function statusesMatch(dbStatus, expectedStatus) {
  return upper(dbStatus) === upper(expectedStatus)
}

function isPickupRow(row) {
  const fromRow = upper(row?.delivery_method)
  if (fromRow === 'PICKUP') return true
  if (fromRow === 'DELIVERY' || fromRow === 'SHIPMENT') return false
  const pickup = parsePickupDetails(row?.pickup_details)
  const method = upper(pickup?.deliveryMethod || pickup?.delivery_method)
  if (method === 'PICKUP') return true
  if (method === 'DELIVERY') return false
  return !(pickup?.address && (pickup?.city || pickup?.zipCode))
}

/**
 * When Square API is unavailable, infer likely status from DB timestamps.
 * Pickup + COMPLETED + never updated after insert → almost always a mis-map (see ORD-MO8T3WGA-Z6IY).
 *
 * @param {Record<string, unknown>} row
 * @returns {{ status: string, reason: string } | null}
 */
export function inferStatusFromDbHeuristics(row) {
  if (!isPickupRow(row)) return null

  const dbStatus = upper(row?.status)
  const created = row?.created_at ? new Date(row.created_at).getTime() : NaN
  const updated = row?.updated_at ? new Date(row.updated_at).getTime() : NaN
  const deltaMs = Number.isFinite(created) && Number.isFinite(updated) ? updated - created : NaN
  const neverUpdated = Number.isFinite(deltaMs) && deltaMs < 2000

  if (dbStatus === 'COMPLETED' && neverUpdated) {
    return { status: 'PREPARED', reason: 'heuristic_pickup_completed_same_timestamp' }
  }

  return null
}
