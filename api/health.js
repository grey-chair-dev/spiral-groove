/**
 * GET /api/health
 *
 * Lightweight uptime probe: confirms the API runtime + Neon respond.
 * Point Better Stack / UptimeRobot here (and optionally the homepage).
 * Returns 503 when the DB is unreachable so external monitors page.
 */
import { query } from './db.js'
import { logger } from './_lib/logger.js'
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
    const ms = Date.now() - started
    // Keep health probes quiet on success (UptimeRobot polls often).
    return json(200, {
      status: 'ok',
      db: 'ok',
      ms,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const ms = Date.now() - started
    const errorId = logger.error('health_db_unreachable', error, {
      event: 'health_check',
      endpoint: '/api/health',
      statusCode: 503,
      durationMs: ms,
    })
    return json(503, {
      status: 'down',
      db: 'error',
      error: 'database_unreachable',
      errorId,
      ms,
      timestamp: new Date().toISOString(),
    })
  }
}

export default withWebHandler(webHandler)
