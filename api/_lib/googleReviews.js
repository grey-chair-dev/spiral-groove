/**
 * Google Business Profile review automation (replaces Make Auto Reply + Review Reply).
 *
 * Env:
 *   GOOGLE_GBP_CLIENT_ID / GOOGLE_GBP_CLIENT_SECRET / GOOGLE_GBP_REFRESH_TOKEN
 *   GOOGLE_GBP_ACCOUNT_ID (default from Make)
 *   GOOGLE_GBP_LOCATION_ID (default from Make)
 *   GOOGLE_REVIEW_ALERT_TO (default adam@spiralgrooverecords.com)
 *   SITE_URL (for edit-reply + reply API links)
 */
import { sendMail } from './mailer.js'

export const DEFAULT_GBP_ACCOUNT_ID = '106811615467335080576'
export const DEFAULT_GBP_LOCATION_ID = '881536039797390580'
export const DEFAULT_REVIEW_ALERT_TO = 'adam@spiralgrooverecords.com'

const STAR_MAP = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
}

export class GoogleGbpError extends Error {
  /**
   * @param {string} message
   * @param {{ status?: number, class?: string }} [meta]
   */
  constructor(message, meta = {}) {
    super(message)
    this.name = 'GoogleGbpError'
    this.status = meta.status
    this.class = meta.class || 'other'
  }
}

export function starRatingToNumber(starRating) {
  if (typeof starRating === 'number' && Number.isFinite(starRating)) return starRating
  const key = String(starRating || '').trim().toUpperCase()
  if (STAR_MAP[key] != null) return STAR_MAP[key]
  const n = Number(starRating)
  return Number.isFinite(n) ? n : 0
}

export function starRatingLabel(starRating) {
  const n = starRatingToNumber(starRating)
  if (n >= 1 && n <= 5) return String(n)
  return String(starRating || '?')
}

/** Make: FOUR/FIVE auto-post; ONE/TWO/THREE email owner. */
export function routeForStars(starRating) {
  const n = starRatingToNumber(starRating)
  if (n >= 4) return 'auto_reply'
  if (n >= 1 && n <= 3) return 'email'
  return 'skip'
}

export function reviewHasComment(review) {
  const comment = review?.comment ?? review?.text ?? ''
  return String(comment).trim().length > 0
}

export function reviewReplyPrompt(comment) {
  return `You are the owner of Spiral Groove Records replying to a customer review. Write a short, straightforward response in a calm, grounded tone. Keep it under 50 words. The voice should feel personal but not overly emotional. No emojis. No corporate language. No exaggerated enthusiasm. Sound like a small business owner who takes pride in the shop and appreciates the community. Thank the customer, acknowledge their experience briefly, and close naturally. Review:${comment}`
}

export function siteBaseUrl(env = process.env) {
  const raw = String(env.SITE_URL || 'https://www.spiralgrooverecords.com').trim().replace(/\/$/, '')
  return raw || 'https://www.spiralgrooverecords.com'
}

export function locationParent(env = process.env) {
  const account = String(env.GOOGLE_GBP_ACCOUNT_ID || DEFAULT_GBP_ACCOUNT_ID).trim()
  const location = String(env.GOOGLE_GBP_LOCATION_ID || DEFAULT_GBP_LOCATION_ID).trim()
  return `accounts/${account}/locations/${location}`
}

/**
 * Build owner email HTML (Make template).
 * Post link hits our reply API with a token query; Edit opens /edit-reply.
 */
export function buildReviewAlertHtml({
  reviewerName,
  starRating,
  createTime,
  comment,
  suggestedReply,
  reviewName,
  siteUrl,
  replyToken,
}) {
  const base = String(siteUrl || '').replace(/\/$/, '')
  const q = new URLSearchParams({
    reviewId: reviewName,
    response: suggestedReply,
  })
  if (replyToken) q.set('token', replyToken)
  const editHref = `${base}/edit-reply?${new URLSearchParams({
    reviewId: reviewName,
    response: suggestedReply,
    ...(replyToken ? { token: replyToken } : {}),
  }).toString()}`
  // POST form target for "Post this reply" — GET with long reply text breaks; use API URL with token in email as button to edit page that can one-click, OR use a short GET to reply with encoded body.
  // Make used GET webhook; we use link to edit-reply with autoSubmit=1 for post convenience + separate post via API from edit page.
  const postHref = `${base}/edit-reply?${new URLSearchParams({
    reviewId: reviewName,
    response: suggestedReply,
    autoPost: '1',
    ...(replyToken ? { token: replyToken } : {}),
  }).toString()}`

  const stars = starRatingLabel(starRating)
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Google review</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 1.5; color: #333; max-width: 560px; margin: 0 auto; padding: 24px;">
  <h1 style="font-size: 1.25rem; margin-bottom: 16px;">New Google review</h1>

  <div style="margin-bottom: 20px; padding: 16px; background: #f5f5f5; border-radius: 8px;">
    <p style="margin: 0 0 8px;"><strong>Reviewer:</strong> ${escapeHtml(reviewerName || 'Anonymous')}</p>
    <p style="margin: 0 0 8px;"><strong>Rating:</strong> ${escapeHtml(stars)} stars</p>
    <p style="margin: 0 0 8px;"><strong>Date:</strong> ${escapeHtml(createTime || '')}</p>
    <p style="margin: 0;"><strong>Review:</strong><br>${escapeHtml(comment || '')}</p>
  </div>

  <div style="margin-bottom: 20px;">
    <p style="margin: 0 0 8px; font-weight: 600;">Suggested reply</p>
    <p style="margin: 0; padding: 12px; background: #f0f7ff; border-left: 4px solid #2563eb; border-radius: 4px;">${escapeHtml(suggestedReply || '')}</p>
  </div>

  <p style="margin-bottom: 8px;">
    <a href="${escapeAttr(postHref)}" style="display: inline-block; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">Post this reply</a>
    <span style="margin-left: 8px;">
      <a href="${escapeAttr(editHref)}" style="display: inline-block; padding: 10px 20px; background: #64748b; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">Edit</a>
    </span>
  </p>
</body>
</html>`
}

export function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function escapeAttr(s) {
  return escapeHtml(s).replace(/'/g, '&#39;')
}

export function gbpConfigured(env = process.env) {
  return Boolean(
    env.GOOGLE_GBP_CLIENT_ID && env.GOOGLE_GBP_CLIENT_SECRET && env.GOOGLE_GBP_REFRESH_TOKEN,
  )
}

let cachedToken = { accessToken: '', expiresAt: 0 }

/**
 * @param {typeof fetch} [fetchImpl]
 * @param {NodeJS.ProcessEnv} [env]
 */
export async function getGbpAccessToken(env = process.env, fetchImpl = fetch) {
  const now = Date.now()
  if (cachedToken.accessToken && cachedToken.expiresAt > now + 60_000) {
    return cachedToken.accessToken
  }
  const clientId = env.GOOGLE_GBP_CLIENT_ID
  const clientSecret = env.GOOGLE_GBP_CLIENT_SECRET
  const refreshToken = env.GOOGLE_GBP_REFRESH_TOKEN
  if (!clientId || !clientSecret || !refreshToken) {
    throw new GoogleGbpError('GOOGLE_GBP_CLIENT_ID/SECRET/REFRESH_TOKEN not set', { class: 'auth' })
  }
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  })
  const res = await fetchImpl('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    signal: AbortSignal.timeout(20_000),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || !json.access_token) {
    throw new GoogleGbpError(`GBP token refresh failed: ${json.error || res.status}`, {
      status: res.status,
      class: 'auth',
    })
  }
  cachedToken = {
    accessToken: json.access_token,
    expiresAt: now + Number(json.expires_in || 3600) * 1000,
  }
  return cachedToken.accessToken
}

/** Test helper */
export function _resetGbpTokenCache() {
  cachedToken = { accessToken: '', expiresAt: 0 }
}

/**
 * @param {{ pageSize?: number, orderBy?: string }} [opts]
 */
export async function listReviews(opts = {}, env = process.env, fetchImpl = fetch) {
  const token = await getGbpAccessToken(env, fetchImpl)
  const parent = locationParent(env)
  const pageSize = Math.min(Math.max(Number(opts.pageSize) || 20, 1), 50)
  const orderBy = opts.orderBy || 'updateTime desc'
  const url = new URL(`https://mybusiness.googleapis.com/v4/${parent}/reviews`)
  url.searchParams.set('pageSize', String(pageSize))
  url.searchParams.set('orderBy', orderBy)
  const res = await fetchImpl(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(30_000),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    const cls = res.status === 401 || res.status === 403 ? 'auth' : res.status === 429 ? 'rate' : 'other'
    throw new GoogleGbpError(`listReviews failed: ${json.error?.message || res.status}`, {
      status: res.status,
      class: cls,
    })
  }
  return Array.isArray(json.reviews) ? json.reviews : []
}

/**
 * @param {string} reviewName full resource name accounts/.../reviews/...
 * @param {string} comment
 */
export async function updateReply(reviewName, comment, env = process.env, fetchImpl = fetch) {
  const token = await getGbpAccessToken(env, fetchImpl)
  const name = String(reviewName || '').trim()
  const text = String(comment || '').trim()
  if (!name) throw new GoogleGbpError('reviewId required', { status: 400, class: 'other' })
  if (!text) throw new GoogleGbpError('response required', { status: 400, class: 'other' })
  const res = await fetchImpl(`https://mybusiness.googleapis.com/v4/${name}/reply`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ comment: text }),
    signal: AbortSignal.timeout(30_000),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    const cls = res.status === 401 || res.status === 403 ? 'auth' : res.status === 429 ? 'rate' : 'other'
    throw new GoogleGbpError(`updateReply failed: ${json.error?.message || res.status}`, {
      status: res.status,
      class: cls,
    })
  }
  return json
}

export async function ensureGoogleReviewEventsTable(query) {
  await query(`
    CREATE TABLE IF NOT EXISTS google_review_events (
      review_name TEXT PRIMARY KEY,
      star_rating TEXT,
      action TEXT NOT NULL,
      reviewer_name TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
}

export async function isReviewProcessed(query, reviewName) {
  const r = await query(`SELECT 1 FROM google_review_events WHERE review_name = $1 LIMIT 1`, [reviewName])
  return (r?.rowCount || r?.rows?.length || 0) > 0
}

export async function markReviewProcessed(query, { reviewName, starRating, action, reviewerName }) {
  await query(
    `INSERT INTO google_review_events (review_name, star_rating, action, reviewer_name)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (review_name) DO NOTHING`,
    [reviewName, String(starRating || ''), action, reviewerName || null],
  )
}

/**
 * Process a single GBP review object.
 * @param {object} review
 * @param {{ query: Function, complete: (p: string) => Promise<string>, dryRun?: boolean, env?: object, fetchImpl?: typeof fetch, sendMailImpl?: typeof sendMail }} deps
 */
export async function processReview(review, deps) {
  const {
    query,
    complete,
    dryRun = false,
    env = process.env,
    fetchImpl = fetch,
    sendMailImpl = sendMail,
  } = deps

  const reviewName = String(review?.name || '').trim()
  if (!reviewName) return { status: 'skip', reason: 'missing_name' }
  if (!reviewHasComment(review)) return { status: 'skip', reason: 'no_comment', reviewName }

  if (await isReviewProcessed(query, reviewName)) {
    return { status: 'skip', reason: 'already_processed', reviewName }
  }

  const comment = String(review.comment || review.text || '').trim()
  const starRating = review.starRating
  const route = routeForStars(starRating)
  if (route === 'skip') return { status: 'skip', reason: 'unknown_stars', reviewName, starRating }

  const suggestedReply = String(await complete(reviewReplyPrompt(comment))).trim()
  if (!suggestedReply) return { status: 'skip', reason: 'empty_llm', reviewName }

  const reviewerName = review?.reviewer?.displayName || review?.reviewer?.display_name || 'Anonymous'
  const createTime = review.createTime || review.updateTime || ''

  if (route === 'auto_reply') {
    if (!dryRun) {
      await updateReply(reviewName, suggestedReply, env, fetchImpl)
      await markReviewProcessed(query, {
        reviewName,
        starRating,
        action: 'auto_replied',
        reviewerName,
      })
    }
    return { status: 'auto_replied', reviewName, starRating, dryRun: Boolean(dryRun) }
  }

  // email path
  const to = String(env.GOOGLE_REVIEW_ALERT_TO || DEFAULT_REVIEW_ALERT_TO).trim()
  const replyToken = String(env.GOOGLE_REVIEW_REPLY_SECRET || env.WEBHOOK_SECRET || '').trim()
  const html = buildReviewAlertHtml({
    reviewerName,
    starRating,
    createTime,
    comment,
    suggestedReply,
    reviewName,
    siteUrl: siteBaseUrl(env),
    replyToken,
  })
  const subject = `New Review From Google - ${starRatingLabel(starRating)} Start Review`
  if (!dryRun) {
    await sendMailImpl('sgr', { to, subject, html })
    await markReviewProcessed(query, {
      reviewName,
      starRating,
      action: 'emailed',
      reviewerName,
    })
  }
  return { status: 'emailed', reviewName, starRating, to, dryRun: Boolean(dryRun) }
}

/**
 * Sync recent reviews.
 */
export async function syncGoogleReviews({
  query,
  complete,
  dryRun = false,
  env = process.env,
  fetchImpl = fetch,
  sendMailImpl = sendMail,
  pageSize = 20,
}) {
  await ensureGoogleReviewEventsTable(query)
  const reviews = await listReviews({ pageSize, orderBy: 'updateTime desc' }, env, fetchImpl)
  const results = []
  for (const review of reviews) {
    results.push(await processReview(review, { query, complete, dryRun, env, fetchImpl, sendMailImpl }))
  }
  return {
    fetched: reviews.length,
    autoReplied: results.filter((r) => r.status === 'auto_replied').length,
    emailed: results.filter((r) => r.status === 'emailed').length,
    skipped: results.filter((r) => r.status === 'skip').length,
    dryRun: Boolean(dryRun),
    results,
  }
}
