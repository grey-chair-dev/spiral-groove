import { withWebHandler } from '../_vercelNodeAdapter.js'
import { syncSquareToNeon } from '../squareSync.js'

export const config = {
  runtime: 'nodejs',
}

/**
 * POST /api/square/sync
 *
 * Triggers a Square → Neon sync for products_cache.
 * Intended to be called by Make.com or admin tooling (protected by WEBHOOK_SECRET).
 *
 * Body (JSON):
 * {
 *   full?: boolean,
 *   squareItemIds?: string[],
 *   squareVariationIds?: string[],
 *   limit?: number
 * }
 */
export async function webHandler(request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed. Use POST.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Require secret in production
  const webhookSecret = request.headers.get('x-webhook-secret')
  if (process.env.NODE_ENV === 'production' && process.env.WEBHOOK_SECRET && webhookSecret !== process.env.WEBHOOK_SECRET) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized. Invalid webhook secret.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await request.json()
    const full = Boolean(body?.full)
    const squareItemIds = Array.isArray(body?.squareItemIds) ? body.squareItemIds : undefined
    const squareVariationIds = Array.isArray(body?.squareVariationIds) ? body.squareVariationIds : undefined
    const limit = body?.limit != null ? Number(body.limit) : 0

    const result = await syncSquareToNeon({ full, squareItemIds, squareVariationIds, limit })

    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: e?.message || 'Sync failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }
}

export default withWebHandler(webHandler)

