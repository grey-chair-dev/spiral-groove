/**
 * GET/POST /api/google-reviews-sync
 * Vercel Cron every 15m — replaces Make "Auto Reply Google Reviews".
 * Gated by Vercel flag `googleReviews` (default off).
 */
import { query } from './db.js'
import { withWebHandler } from './_vercelNodeAdapter.js'
import { createCompleter, LlmProviderError, llmConfigured } from './_lib/staffPicks.js'
import {
  GoogleGbpError,
  gbpConfigured,
  syncGoogleReviews,
} from './_lib/googleReviews.js'
import { evaluateGoogleReviewsFlag } from './flags/evaluateGoogleReviews.js'
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

  const flagOn = await evaluateGoogleReviewsFlag(request)
  if (!flagOn) {
    return json(200, { success: true, skipped: 'flag_off', flag: 'googleReviews' })
  }

  if (!gbpConfigured()) {
    return json(200, { success: true, skipped: 'GOOGLE_GBP_* credentials not set' })
  }
  if (!llmConfigured()) {
    return json(200, { success: true, skipped: 'STAFF_PICKS_LLM_API_KEY (or OPENAI/ANTHROPIC) not set' })
  }

  const url = new URL(request.url)
  const dryRun =
    url.searchParams.get('dryRun') === '1' ||
    url.searchParams.get('dryRun') === 'true' ||
    process.env.GOOGLE_REVIEWS_DRY_RUN === '1'

  try {
    const result = await syncGoogleReviews({
      query,
      complete: createCompleter(process.env, fetch, { maxTokens: 256 }),
      dryRun,
    })
    logger.info('google_reviews_sync', { event: 'google_reviews_sync', ...result, results: undefined })
    return json(200, { success: true, ...result })
  } catch (error) {
    if (error instanceof GoogleGbpError) {
      const cls = error.class || 'other'
      const statusCode = cls === 'auth' || cls === 'rate' ? 503 : 502
      logger.error('google_reviews_gbp_failed', error, {
        event: 'google_reviews_gbp_failed',
        gbpClass: cls,
        endpoint: '/api/google-reviews-sync',
        statusCode,
      })
      void sendSlackAlert({
        statusCode,
        error: `Google reviews GBP failed (${cls}): ${error.message}`,
        endpoint: '/api/google-reviews-sync',
        method,
        dedupeKey: `google-reviews-sync:gbp:${cls}`,
        dedupeTtlMs: 60 * 60 * 1000,
      })
      return json(statusCode, { success: false, error: 'GBP request failed', class: cls })
    }

    const llm = error instanceof LlmProviderError ? error : null
    const kind = llm?.kind || 'other'
    const statusCode = kind === 'rate_limit' || kind === 'quota' || kind === 'auth' ? 503 : 500
    logger.error('google_reviews_sync_failed', error, {
      event: 'google_reviews_sync_failed',
      llmKind: kind,
      endpoint: '/api/google-reviews-sync',
      statusCode,
    })
    void sendSlackAlert({
      statusCode,
      error: `Google reviews sync failed: ${error?.message || error}`,
      endpoint: '/api/google-reviews-sync',
      method,
      dedupeKey: `google-reviews-sync:fail:${kind}`,
      dedupeTtlMs: 60 * 60 * 1000,
    })
    return json(statusCode, { success: false, error: 'Google reviews sync failed', llmKind: kind })
  }
}

export default withWebHandler(webHandler)
