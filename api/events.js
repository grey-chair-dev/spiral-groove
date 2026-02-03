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

    // Optimized query: filter to future events and use index-friendly ordering
    // The composite index events_is_event_date_idx should handle this efficiently
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
        start_time::text AS start_time,
        end_time::text AS end_time,
        (event_date::text || 'T' || start_time::text) AS start_datetime_iso,
        (event_date::text || 'T' || end_time::text) AS end_datetime_iso,
        TO_CHAR(start_time, 'FMHH12:MI AM') AS start_time_label,
        TO_CHAR(end_time, 'FMHH12:MI AM') AS end_time_label,
        event_description,
        confidence,
        event_image_url,
        event_permalink,
        fingerprint,
        created_at,
        updated_at
      FROM events
      WHERE is_event = true
        AND event_date >= CURRENT_DATE
      ORDER BY event_date ASC, start_time ASC NULLS LAST, id ASC`
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

