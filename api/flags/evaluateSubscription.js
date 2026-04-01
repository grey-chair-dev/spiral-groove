import { subscriptionFlag } from './registry.js'

/**
 * Evaluate the Vercel `subscription` flag.
 * @param {Request | null | undefined} request - Incoming request (cron/API). If omitted, uses a minimal Request for scripts.
 */
export async function evaluateSubscriptionFlag(request) {
  try {
    const req =
      request && typeof request.headers !== 'undefined'
        ? request
        : new Request('https://internal.local/flags', {
            method: 'GET',
            headers: { 'user-agent': 'spiral-groove-batch/1.0' },
          })
    return await subscriptionFlag(req)
  } catch (err) {
    console.warn('[evaluateSubscriptionFlag]', err?.message || err)
    return false
  }
}
