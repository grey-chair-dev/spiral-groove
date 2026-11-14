import { googleReviewsFlag } from './registry.js'

/**
 * Evaluate the Vercel `googleReviews` flag.
 * @param {Request | null | undefined} request
 */
export async function evaluateGoogleReviewsFlag(request) {
  try {
    const req =
      request && typeof request.headers !== 'undefined'
        ? request
        : new Request('https://internal.local/flags', {
            method: 'GET',
            headers: { 'user-agent': 'spiral-groove-batch/1.0' },
          })
    return await googleReviewsFlag(req)
  } catch (err) {
    console.warn('[evaluateGoogleReviewsFlag]', err?.message || err)
    return false
  }
}
