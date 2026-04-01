import { withWebHandler } from '../_vercelNodeAdapter.js'
import { subscriptionFlag } from './registry.js'

export const config = {
  runtime: 'nodejs',
}

/**
 * GET /api/flags/subscription
 * Evaluates the `subscription` Vercel flag for the current request (cookies / overrides).
 */
export async function webHandler(request) {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const value = await subscriptionFlag(request)
    return new Response(
      JSON.stringify({ success: true, key: 'subscription', value }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (err) {
    console.error('[flags/subscription]', err)
    return new Response(
      JSON.stringify({
        success: false,
        error: err?.message || 'Failed to evaluate flag',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

export default withWebHandler(webHandler)
