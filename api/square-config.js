import { withWebHandler } from './_vercelNodeAdapter.js'

export const config = { runtime: 'nodejs' }

/**
 * GET /api/square-config
 *
 * Returns public Square Web Payments config (safe for client):
 * - applicationId
 * - locationId
 * - environment
 */
export async function webHandler(request) {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed. Use GET.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const environment = (process.env.SQUARE_ENVIRONMENT || process.env.SQUARE_ENV || 'production').toLowerCase()
  const applicationId =
    process.env.VITE_SQUARE_APPLICATION_ID ||
    process.env.SQUARE_APPLICATION_ID ||
    process.env.SQUARE_WEB_PAYMENTS_APPLICATION_ID ||
    null
  const locationId =
    process.env.SQUARE_LOCATION_ID ||
    process.env.VITE_SQUARE_LOCATION_ID ||
    null

  return new Response(
    JSON.stringify({
      success: true,
      square: {
        environment,
        applicationId,
        locationId,
      },
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // safe for short caching, config rarely changes
        'Cache-Control': 'public, max-age=60',
      },
    },
  )
}

export default withWebHandler(webHandler)

