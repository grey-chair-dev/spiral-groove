/**
 * GET/POST /api/instagram-events-sync
 * Daily Vercel Cron (see vercel.json) — replaces Make "Events From Instagram".
 * Auth: cron Bearer / x-vercel-cron; POST with x-webhook-secret for manual runs.
 */
import { query } from './db.js'
import { withWebHandler } from './_vercelNodeAdapter.js'
import { createCompleter, LlmProviderError, llmConfigured } from './_lib/staffPicks.js'
import { InstagramFetchError, syncInstagramEvents } from './_lib/instagramEvents.js'
import { logger } from './_lib/logger.js'
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

  if (!llmConfigured()) {
    return json(200, { success: true, skipped: 'STAFF_PICKS_LLM_API_KEY (or OPENAI/ANTHROPIC) not set' })
  }

  const url = new URL(request.url)
  const dryRun =
    url.searchParams.get('dryRun') === '1' ||
    url.searchParams.get('dryRun') === 'true' ||
    process.env.INSTAGRAM_EVENTS_DRY_RUN === '1'

  try {
    const result = await syncInstagramEvents({
      query,
      complete: createCompleter(process.env, fetch, { maxTokens: 1024 }),
      dryRun,
    })
    logger.info('instagram_events_sync', { event: 'instagram_events_sync', ...result })
    return json(200, { success: true, ...result })
  } catch (error) {
    if (error instanceof InstagramFetchError) {
      const cls = error.class || 'other'
      const statusCode = cls === 'auth' || cls === 'rate' || cls === 'blocked' ? 503 : 502
      logger.error('instagram_events_fetch_failed', error, {
        event: 'instagram_events_fetch_failed',
        igClass: cls,
        endpoint: '/api/instagram-events-sync',
        statusCode,
      })
      void sendSlackAlert({
        statusCode,
        error: `Instagram events fetch failed (${cls}): ${error.message}`,
        endpoint: '/api/instagram-events-sync',
        method,
        dedupeKey: `instagram-events-sync:fetch:${cls}`,
        dedupeTtlMs: 60 * 60 * 1000,
      })
      return json(statusCode, { success: false, error: 'Instagram fetch failed', class: cls })
    }

    const llm = error instanceof LlmProviderError ? error : null
    const kind = llm?.kind || 'other'
    const statusCode = kind === 'rate_limit' || kind === 'quota' || kind === 'auth' ? 503 : 500
    logger.error('instagram_events_sync_failed', error, {
      event: 'instagram_events_sync_failed',
      llmKind: kind,
      endpoint: '/api/instagram-events-sync',
      statusCode,
    })
    void sendSlackAlert({
      statusCode,
      error: `Instagram events sync failed: ${error?.message || error}`,
      endpoint: '/api/instagram-events-sync',
      method,
      dedupeKey: `instagram-events-sync:fail:${kind}`,
      dedupeTtlMs: 60 * 60 * 1000,
    })
    return json(statusCode, { success: false, error: 'Instagram events sync failed', llmKind: kind })
  }
}

export default withWebHandler(webHandler)
