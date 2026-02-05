/**
 * GET /api/events
 *
 * Fetches events from the Neon PostgreSQL database.
 * Table: events
 *
 * Returns: { success: true, events: ApiEvent[] }
 */

import { query } from './db.js'
import { notifyWebhook } from './notifyWebhook.js'
import { sendSlackAlert } from './slackAlerts.js'
import { withWebHandler } from './_vercelNodeAdapter.js'

// Simple in-memory cache (same rationale as /api/products)
let lastEvents = null
let lastFetchedAt = 0
const CACHE_TTL_MS = 30_000
const STALE_TTL_MS = 10 * 60 * 1000

// Best-effort schema guard so prod doesn't 500 if the events table (or columns) are missing.
let didEnsureEventsSchema = false

async function ensureEventsSchema() {
  if (didEnsureEventsSchema) return
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS events (
        id BIGSERIAL PRIMARY KEY,
        is_event BOOLEAN DEFAULT TRUE,
        event_type TEXT,
        event_name TEXT,
        artist TEXT,
        venue TEXT,
        event_date DATE,
        start_time TIME,
        end_time TIME,
        event_description TEXT,
        confidence NUMERIC,
        event_image_url TEXT,
        event_permalink TEXT,
        fingerprint TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Add columns idempotently for existing tables.
    await query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS is_event BOOLEAN DEFAULT TRUE`)
    await query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS event_type TEXT`)
    await query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS event_name TEXT`)
    await query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS artist TEXT`)
    await query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS venue TEXT`)
    await query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS event_date DATE`)
    await query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS start_time TIME`)
    await query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS end_time TIME`)
    await query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS event_description TEXT`)
    await query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS confidence NUMERIC`)
    await query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS event_image_url TEXT`)
    await query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS event_permalink TEXT`)
    await query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS fingerprint TEXT`)
    await query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP`)
    await query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP`)

    didEnsureEventsSchema = true
  } catch (e) {
    // Don't fail the request if migrations are blocked; we still handle missing table below.
    console.warn('[Events API] Unable to ensure events schema:', e?.message || e)
    didEnsureEventsSchema = true
  }
}

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export async function webHandler(request) {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()
  
  if (request.method !== 'GET') {
    const { sendSlackAlert } = await import('./slackAlerts.js')
    void sendSlackAlert({
      statusCode: 405,
      error: 'Method not allowed. Use GET.',
      endpoint: '/api/events',
      method: request.method,
      requestId,
      userAgent: request.headers.get('user-agent') || '',
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      dedupeKey: `events:405:${request.method}`,
    })
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed. Use GET.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const url = new URL(request.url)
    const includePast =
      (url.searchParams.get('includePast') || '').toLowerCase() === 'true' ||
      (url.searchParams.get('includePast') || '') === '1'
    const pastDaysRaw = url.searchParams.get('pastDays')
    const pastDays = pastDaysRaw != null ? Math.max(1, Math.min(3650, Number(pastDaysRaw))) : 365

    // Best-effort schema check/migration
    await ensureEventsSchema()

    // Serve hot cache if it's fresh
    if (Array.isArray(lastEvents) && Date.now() - lastFetchedAt < CACHE_TTL_MS) {
      return new Response(JSON.stringify({ success: true, events: lastEvents }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-store',
          'X-Events-Cache': 'HIT',
        },
      })
    }

    if (!process.env.SGR_DATABASE_URL && !process.env.SPR_DATABASE_URL && !process.env.DATABASE_URL) {
      throw new Error('SGR_DATABASE_URL (preferred), SPR_DATABASE_URL (legacy), or DATABASE_URL environment variable is not set')
    }

    // Default: upcoming events only. If includePast=1, include the last N days (pastDays, default 365).
    const where = includePast
      ? `WHERE is_event = true
        AND event_date >= (CURRENT_DATE - ($1::int * INTERVAL '1 day'))`
      : `WHERE is_event = true
        AND event_date >= CURRENT_DATE`

    const params = includePast ? [pastDays] : []

    const result = await query(
      `SELECT
        id,
        is_event,
        event_type,
        event_name,
        artist,
        venue,
        event_date::text AS date_iso,
        TO_CHAR(event_date, 'MON FMDD') AS date_label,
        (NULLIF(start_time::text, ''))::time AS start_time_time,
        (NULLIF(end_time::text, ''))::time AS end_time_time,
        (NULLIF(start_time::text, '')) AS start_time,
        (NULLIF(end_time::text, '')) AS end_time,
        (event_date::text || 'T' || (NULLIF(start_time::text, ''))::time::text) AS start_datetime_iso,
        (event_date::text || 'T' || (NULLIF(end_time::text, ''))::time::text) AS end_datetime_iso,
        TO_CHAR((NULLIF(start_time::text, ''))::time, 'FMHH12:MI AM') AS start_time_label,
        TO_CHAR((NULLIF(end_time::text, ''))::time, 'FMHH12:MI AM') AS end_time_label,
        event_description,
        confidence,
        event_image_url,
        event_permalink,
        fingerprint,
        created_at,
        updated_at
      FROM events
      ${where}
      ORDER BY event_date ASC, start_time_time ASC NULLS LAST, id ASC`
      ,
      params
    )

    const events = result.rows.map((row) => ({
      id: Number(row.id),
      eventType: row.event_type != null ? String(row.event_type) : null,
      eventName: String(row.event_name || ''),
      artist: row.artist != null ? String(row.artist) : null,
      venue: row.venue != null ? String(row.venue) : null,
      eventDescription: String(row.event_description || ''),
      confidence: row.confidence != null ? Number(row.confidence) : null,
      eventImageUrl: row.event_image_url != null ? String(row.event_image_url) : null,
      eventPermalink: row.event_permalink != null ? String(row.event_permalink) : null,
      fingerprint: row.fingerprint != null ? String(row.fingerprint) : null,
      dateISO: row.date_iso != null ? String(row.date_iso) : null,
      dateLabel: row.date_label != null ? String(row.date_label).trim().toUpperCase() : null,
      startTimeLabel: row.start_time_label != null ? String(row.start_time_label).trim().toUpperCase() : null,
      endTimeLabel: row.end_time_label != null ? String(row.end_time_label).trim().toUpperCase() : null,
      startTime: row.start_time != null ? String(row.start_time) : null,
      endTime: row.end_time != null ? String(row.end_time) : null,
      startDateTimeISO: row.start_datetime_iso != null ? String(row.start_datetime_iso) : null,
      endDateTimeISO: row.end_datetime_iso != null ? String(row.end_datetime_iso) : null,
      createdAt: row.created_at != null ? String(row.created_at) : null,
      updatedAt: row.updated_at != null ? String(row.updated_at) : null,
    }))

    lastEvents = events
    lastFetchedAt = Date.now()

    return new Response(JSON.stringify({ success: true, events }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    // If the events table doesn't exist (or schema is incompatible), don't take down the page.
    const msg = String(error?.message || '')
    if (msg.includes('relation') && msg.includes('events') && msg.includes('does not exist')) {
      console.warn('[Events API] events table missing; returning empty list')
      return new Response(JSON.stringify({ success: true, events: [] }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'X-Events-Cache': 'EMPTY',
        },
      })
    }

    // Serve stale cache on transient Neon failures
    if (Array.isArray(lastEvents) && Date.now() - lastFetchedAt < STALE_TTL_MS) {
      console.warn('[Events API] Neon error; serving STALE cache', { ageMs: Date.now() - lastFetchedAt })
      return new Response(JSON.stringify({ success: true, events: lastEvents, stale: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-store',
          'X-Events-Cache': 'STALE',
        },
      })
    }

    console.error('[Events API] Failed to fetch events:', error)

    void notifyWebhook({
      event: 'api.events_error',
      title: '❌ /api/events failed',
      message: error?.message || 'Unknown error',
      context: {
        route: '/api/events',
        name: error?.name,
        hasSgrDatabaseUrl: !!process.env.SGR_DATABASE_URL,
        hasSprDatabaseUrl: !!process.env.SPR_DATABASE_URL,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
      },
      dedupeKey: `events:${error?.message || 'unknown'}`,
    })

    // Enhanced Slack alert for critical database errors
    const responseTime = Date.now() - startTime
    const url = new URL(request.url)
    const queryParams = {}
    for (const [key, value] of url.searchParams.entries()) {
      queryParams[key] = value
    }
    
    const requestHeaders = {}
    const relevantHeaders = ['user-agent', 'referer', 'origin', 'accept']
    for (const header of relevantHeaders) {
      const value = request.headers.get(header)
      if (value) requestHeaders[header] = value
    }
    
    void sendSlackAlert({
      statusCode: 500,
      error: error?.message || 'Unknown error',
      endpoint: '/api/events',
      method: 'GET',
      requestId,
      userAgent: request.headers.get('user-agent') || '',
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      responseTime,
      requestHeaders: Object.keys(requestHeaders).length > 0 ? requestHeaders : undefined,
      queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
      context: {
        errorName: error?.name,
        hasSgrDatabaseUrl: !!process.env.SGR_DATABASE_URL,
        hasSprDatabaseUrl: !!process.env.SPR_DATABASE_URL,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseError: true,
      },
      stack: error?.stack || new Error().stack, // Always include stack trace
      dedupeKey: `events:500:${error?.message || 'unknown'}`,
    })

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to fetch events from Neon database.',
        details:
          process.env.NODE_ENV === 'development'
            ? {
                message: error?.message,
                name: error?.name,
                stack: error?.stack,
              }
            : undefined,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    )
  }
}

export const config = {
  runtime: 'nodejs',
}

export default withWebHandler(webHandler)

