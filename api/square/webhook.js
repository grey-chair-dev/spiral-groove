/**
 * POST /api/square/webhook
 *
 * Square webhook subscription for `inventory.count.updated` and `order.fulfillment.updated`.
 * Replaces the Make.com "Inventory Count" and "Order Status Updates" scenarios.
 *
 * Env:
 *   SQUARE_WEBHOOK_SIGNATURE_KEY  signature key of the subscription (Square Developer → Webhooks)
 *   SQUARE_WEBHOOK_URL            the exact notification URL registered with Square
 *                                 (default https://www.spiralgrooverecords.com/api/square/webhook;
 *                                  apex redirects to www and breaks HMAC)
 *
 * Returns 500 on processing errors so Square retries the delivery.
 * Events of one type are processed one at a time (Postgres advisory lock), as Make did.
 */
import { WebhooksHelper } from 'square'
import { getPool, query } from '../db.js'
import { withWebHandler } from '../_vercelNodeAdapter.js'
import { updateOrderStatus } from '../orders/update.js'
import { HANDLERS } from '../_lib/squareEvents.js'
import { sendSlackAlert } from '../slackAlerts.js'

export const config = {
  runtime: 'nodejs',
}

const DEFAULT_URL = 'https://www.spiralgrooverecords.com/api/square/webhook'

function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

async function withLock(key, fn) {
  const client = await getPool().connect()
  try {
    await client.query('BEGIN')
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`square-webhook:${key}`])
    const result = await fn()
    await client.query('COMMIT')
    return result
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {})
    throw e
  } finally {
    client.release()
  }
}

export async function webHandler(request) {
  if ((request.method || 'GET').toUpperCase() !== 'POST') return json(405, { error: 'Use POST' })

  const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY
  if (!signatureKey) return json(503, { error: 'Square webhook not configured' })

  const raw = await request.text()
  const valid = await WebhooksHelper.verifySignature({
    requestBody: raw,
    signatureHeader: request.headers.get('x-square-hmacsha256-signature') || '',
    signatureKey,
    notificationUrl: process.env.SQUARE_WEBHOOK_URL || DEFAULT_URL,
  }).catch(() => false)
  if (!valid) return json(401, { error: 'Invalid signature' })

  let event
  try {
    event = JSON.parse(raw)
  } catch {
    return json(400, { error: 'Invalid JSON' })
  }

  const handler = HANDLERS[event?.type]
  if (!handler) return json(200, { ok: true, ignored: event?.type || 'unknown' })

  try {
    const result = await withLock(event.type, () => handler(event, { query, updateOrderStatus }))
    console.log('[Square Webhook]', event.type, event.event_id, JSON.stringify(result))
    if (!result.ok) throw new Error(result.error || 'handler failed')
    return json(200, result)
  } catch (error) {
    console.error('[Square Webhook] Failed:', event?.type, event?.event_id, error?.message || error)
    void sendSlackAlert({
      statusCode: 500,
      error: `Square webhook failed: ${error?.message || error}`,
      endpoint: '/api/square/webhook',
      method: 'POST',
      context: { type: event?.type, eventId: event?.event_id },
      dedupeKey: `square-webhook:${event?.type}:${error?.message}`,
    })
    return json(500, { ok: false, error: 'processing failed' })
  }
}

export default withWebHandler(webHandler)
