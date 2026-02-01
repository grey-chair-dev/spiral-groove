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
  const method = (request.method || 'GET').toUpperCase()

  // Vercel Cron jobs hit the path with GET.
  // We only allow GET when it's clearly a Vercel cron invocation.
  const userAgent = request.headers.get('user-agent') || ''
  const xVercelCron = request.headers.get('x-vercel-cron')
  const isVercelCron =
    Boolean(xVercelCron) ||
    /vercel[-\s]?cron/i.test(userAgent)

  if (method === 'GET') {
    if (process.env.NODE_ENV === 'production' && !isVercelCron) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  } else if (method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed. Use POST.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Require secret in production (for non-cron callers)
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
    // Log sync start
    const { query } = await import('../db.js')
    try {
      const logResult = await query(`
        INSERT INTO sync_log (sync_type, status, started_at, metadata)
        VALUES ('products', 'running', NOW(), $1::jsonb)
        RETURNING id
      `, [JSON.stringify({ 
        method, 
        isVercelCron,
        userAgent: userAgent.substring(0, 100)
      })])
      syncLogId = logResult.rows[0]?.id
    } catch (logError) {
      // Don't fail sync if logging fails
      console.warn('[Square Sync] Failed to log start:', logError.message)
    }

    const body = method === 'POST' ? await request.json() : {}
    // Cron GET defaults to a full sync.
    const full = method === 'GET' ? true : Boolean(body?.full)
    const squareItemIds = Array.isArray(body?.squareItemIds) ? body.squareItemIds : undefined
    const squareVariationIds = Array.isArray(body?.squareVariationIds) ? body.squareVariationIds : undefined
    const limit = body?.limit != null ? Number(body.limit) : 0

    const result = await syncSquareToNeon({ full, squareItemIds, squareVariationIds, limit })
    
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
              items_created = COALESCE($3, 0),
              items_updated = COALESCE($4, 0),
              metadata = COALESCE(metadata, '{}'::jsonb) || $5::jsonb
          WHERE id = $6
        `, [
          durationMs,
          result.items || 0,
          result.upserted || 0,
          result.upserted || 0,
          JSON.stringify({ result }),
          syncLogId
        ])
      } catch (logError) {
        console.warn('[Square Sync] Failed to log success:', logError.message)
      }
    }

    return new Response(JSON.stringify({ success: true, result, syncLogId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  } catch (e) {
    const durationMs = Date.now() - startedAt
    const errorMessage = e?.message || 'Sync failed'
    
    // Log sync error
    if (syncLogId) {
      try {
        const { query } = await import('../db.js')
        await query(`
          UPDATE sync_log 
          SET status = 'error',
              completed_at = NOW(),
              duration_ms = $1,
              error_message = $2
          WHERE id = $3
        `, [durationMs, errorMessage.substring(0, 1000), syncLogId])
      } catch (logError) {
        console.warn('[Square Sync] Failed to log error:', logError.message)
      }
    }
    
    return new Response(JSON.stringify({ success: false, error: errorMessage, syncLogId }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }
}

export default withWebHandler(webHandler)

