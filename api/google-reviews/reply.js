/**
 * POST /api/google-reviews/reply
 * Body: { reviewId, response } — replaces Make "Review Reply" webhook.
 * Auth: x-webhook-secret or body.token matching WEBHOOK_SECRET / GOOGLE_REVIEW_REPLY_SECRET.
 * Gated by Vercel flag `googleReviews`.
 */
import { withWebHandler } from '../_vercelNodeAdapter.js'
import { GoogleGbpError, gbpConfigured, updateReply } from '../_lib/googleReviews.js'
import { evaluateGoogleReviewsFlag } from '../flags/evaluateGoogleReviews.js'
import { logger } from '../_lib/logger.js'

export const config = { runtime: 'nodejs' }

function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

function expectedSecret() {
  return process.env.GOOGLE_REVIEW_REPLY_SECRET || process.env.WEBHOOK_SECRET || ''
}

function authorized(request, body) {
  const expected = expectedSecret()
  if (!expected) {
    // Dev without secret: allow non-production
    return process.env.NODE_ENV !== 'production'
  }
  const header = request.headers.get('x-webhook-secret') || ''
  const token = String(body?.token || '').trim()
  return header === expected || token === expected
}

async function parseBody(request) {
  const ct = (request.headers.get('content-type') || '').toLowerCase()
  if (ct.includes('application/json')) {
    return await request.json().catch(() => ({}))
  }
  if (ct.includes('application/x-www-form-urlencoded')) {
    const text = await request.text()
    const params = new URLSearchParams(text)
    return Object.fromEntries(params.entries())
  }
  // Also accept query for GET-style Make links (POST preferred)
  const url = new URL(request.url)
  if (url.searchParams.has('reviewId')) {
    return {
      reviewId: url.searchParams.get('reviewId'),
      response: url.searchParams.get('response'),
      token: url.searchParams.get('token'),
    }
  }
  return await request.json().catch(() => ({}))
}

export async function webHandler(request) {
  const method = (request.method || 'GET').toUpperCase()
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-webhook-secret',
      },
    })
  }
  if (method !== 'POST' && method !== 'GET') return json(405, { success: false, error: 'Method not allowed' })

  const flagOn = await evaluateGoogleReviewsFlag(request)
  if (!flagOn) {
    return json(403, { success: false, error: 'googleReviews flag is off', skipped: 'flag_off' })
  }

  if (!gbpConfigured()) {
    return json(503, { success: false, error: 'GOOGLE_GBP_* credentials not set' })
  }

  const body = await parseBody(request)
  if (!authorized(request, body)) return json(401, { success: false, error: 'Unauthorized' })

  const reviewId = String(body.reviewId || body.review_id || '').trim()
  const response = String(body.response || body.comment || '').trim()
  if (!reviewId || !response) {
    return json(400, { success: false, error: 'reviewId and response required' })
  }

  try {
    const result = await updateReply(reviewId, response)
    logger.info('google_review_reply', { event: 'google_review_reply', reviewId })
    return json(200, { success: true, reviewId, reply: result })
  } catch (error) {
    if (error instanceof GoogleGbpError) {
      const status = error.status && error.status >= 400 ? error.status : 502
      return json(status, { success: false, error: error.message, class: error.class })
    }
    logger.error('google_review_reply_failed', error, { event: 'google_review_reply_failed' })
    return json(500, { success: false, error: error?.message || 'Reply failed' })
  }
}

export default withWebHandler(webHandler)
