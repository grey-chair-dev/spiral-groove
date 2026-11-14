/**
 * GET /api/staff-picks-weekly  (Vercel Cron, Mondays 07:45 UTC — see vercel.json)
 * Replaces the Make.com "Staff Picks" scenario. Logic in api/_lib/staffPicks.js.
 *
 * Auth: in production only Vercel Cron (Authorization: Bearer CRON_SECRET when CRON_SECRET is set,
 * else the x-vercel-cron header, like the other crons). POST with x-webhook-secret runs it by hand.
 */
import { query, withTransaction } from './db.js'
import { withWebHandler } from './_vercelNodeAdapter.js'
import { createCompleter, llmConfigured, refreshStaffPicks } from './_lib/staffPicks.js'
import { sendSlackAlert } from './slackAlerts.js'

export const config = {
  runtime: 'nodejs',
  maxDuration: 120,
}

function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

function authorized(request) {
  if (process.env.NODE_ENV !== 'production') return true
  const method = (request.method || 'GET').toUpperCase()
  if (method === 'POST') {
    const secret = process.env.WEBHOOK_SECRET
    return Boolean(secret) && request.headers.get('x-webhook-secret') === secret
  }
  if (process.env.CRON_SECRET) return request.headers.get('authorization') === `Bearer ${process.env.CRON_SECRET}`
  return Boolean(request.headers.get('x-vercel-cron')) || /vercel[-\s]?cron/i.test(request.headers.get('user-agent') || '')
}

export async function webHandler(request) {
  const method = (request.method || 'GET').toUpperCase()
  if (method !== 'GET' && method !== 'POST') return json(405, { success: false, error: 'Method not allowed' })
  if (!authorized(request)) return json(401, { success: false, error: 'Unauthorized' })

  // Not set up yet (Make still runs Staff Picks until the LLM key is added here).
  if (!llmConfigured()) return json(200, { success: true, skipped: 'STAFF_PICKS_LLM_API_KEY not set' })

  try {
    const result = await refreshStaffPicks({ query, complete: createCompleter(), withTransaction })
    console.log('[Staff Picks]', JSON.stringify(result))
    return json(200, { success: true, ...result })
  } catch (error) {
    console.error('[Staff Picks] Failed:', error?.message || error)
    void sendSlackAlert({
      statusCode: 500,
      error: `Staff Picks refresh failed: ${error?.message || error}`,
      endpoint: '/api/staff-picks-weekly',
      method,
      dedupeKey: 'staff-picks-weekly:500',
    })
    return json(500, { success: false, error: 'Staff Picks refresh failed' })
  }
}

export default withWebHandler(webHandler)
