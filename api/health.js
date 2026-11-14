/**
 * GET /api/health
 *
 * Lightweight uptime probe: confirms the API runtime + Neon respond.
 * Point Better Stack / UptimeRobot here (and optionally the homepage).
 * Returns 503 when the DB is unreachable so external monitors page.
 */
import { query } from './db.js'
import { withWebHandler } from './_vercelNodeAdapter.js'

export const config = {
  runtime: 'nodejs',
}

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  })
}

export async function webHandler(request) {
  if ((request.method || 'GET').toUpperCase() !== 'GET') {
    return json(405, { status: 'error', error: 'Use GET' })
  }

  const started = Date.now()
  try {
    await query('SELECT 1 AS ok')
    return json(200, {
      status: 'ok',
      db: 'ok',
      ms: Date.now() - started,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Health] DB check failed:', error?.message || error)
    return json(503, {
      status: 'down',
      db: 'error',
      error: 'database_unreachable',
      ms: Date.now() - started,
      timestamp: new Date().toISOString(),
    })
  }
}

export default withWebHandler(webHandler)
