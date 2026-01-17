/**
 * Lightweight webhook notifier (Make.com / Zapier / etc.)
 *
 * Configure with:
 *   MAKE_WEBHOOK_URL="https://hook.us2.make.com/...."
 *
 * Notes:
 * - Dedupe is best-effort (in-memory). In serverless it may reset between invocations.
 * - Failures to notify should never break API responses.
 */
const DEFAULT_DEDUPE_TTL_MS = 5 * 60 * 1000
const dedupeMap = new Map() // key -> ts
function shouldSend(dedupeKey, ttlMs) {
  if (!dedupeKey) return true
  const now = Date.now()
  const last = dedupeMap.get(dedupeKey)
  if (last && now - last < ttlMs) return false
  dedupeMap.set(dedupeKey, now)
  return true
}
/**
 * @param {Object} payload
 * @param {string} payload.event
 * @param {string} payload.title
 * @param {string} [payload.message]
 * @param {Object} [payload.context]
 * @param {string} [payload.dedupeKey]
 * @param {number} [payload.dedupeTtlMs]
 */
export async function notifyWebhook(payload) {
  try {
    const url = process.env.MAKE_WEBHOOK_URL
    if (!url) return
    const dedupeTtlMs = payload?.dedupeTtlMs ?? DEFAULT_DEDUPE_TTL_MS
    if (!shouldSend(payload?.dedupeKey, dedupeTtlMs)) return
    const body = {
      ts: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development',
      ...payload,
    }
    // Prefer fetch (Node 18+). If unavailable, silently skip.
    if (typeof fetch !== 'function') {
      console.warn('[Webhook] fetch() not available; skipping notify')
      return
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    // Helpful in dev to confirm delivery without breaking anything.
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Webhook] Sent', { event: payload?.event, status: res.status, ok: res.ok })
    }
  } catch (e) {
    console.warn('[Webhook] notify failed:', e?.message || e)
  }
}


