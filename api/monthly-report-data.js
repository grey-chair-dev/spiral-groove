/**
 * GET /api/monthly-report-data
 *
 * Returns last month's report data (sales, newsletter, events, inventory) as JSON.
 * For use by Make.com when building the full monthly report with GA4 (OAuth) — no service account needed.
 *
 * Secured by: ?secret=MONTHLY_REPORT_DATA_SECRET or header x-monthly-report-secret
 * Env: MONTHLY_REPORT_DATA_SECRET (required for this endpoint to return data)
 */

import { withWebHandler } from './_vercelNodeAdapter.js'
import { query } from './db.js'

export const config = {
  runtime: 'nodejs',
}

function getPreviousMonthRange() {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = now.getUTCMonth()
  const firstDay = new Date(Date.UTC(year, month - 1, 1))
  const lastDay = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return {
    startStr: firstDay.toISOString().slice(0, 10),
    endStr: lastDay.toISOString().slice(0, 10),
    monthLabel: monthNames[firstDay.getUTCMonth()],
    year: firstDay.getUTCFullYear(),
  }
}

async function fetchSales(startStr, endStr) {
  try {
    const result = await query(
      `SELECT COUNT(*)::int AS order_count, COALESCE(SUM(total_cents), 0)::bigint AS revenue_cents
       FROM orders
       WHERE created_at >= $1::timestamptz AND created_at <= $2::timestamptz`,
      [startStr + 'T00:00:00.000Z', endStr + 'T23:59:59.999Z']
    )
    const row = result.rows[0]
    return { orderCount: row ? Number(row.order_count) : 0, revenueCents: row ? Number(row.revenue_cents) : 0 }
  } catch (err) {
    console.error('[Monthly Report Data] Sales query failed:', err?.message)
    return {}
  }
}

async function fetchNewsletter(startStr, endStr) {
  try {
    let totalResult, newResult
    try {
      totalResult = await query(`SELECT COUNT(*)::int AS n FROM email_list WHERE subscribed = TRUE AND email IS NOT NULL AND email != ''`)
      newResult = await query(
        `SELECT COUNT(*)::int AS n FROM email_list
         WHERE subscribed = TRUE AND email IS NOT NULL AND email != ''
           AND created_at >= $1::timestamptz AND created_at <= $2::timestamptz`,
        [startStr + 'T00:00:00.000Z', endStr + 'T23:59:59.999Z']
      )
    } catch (e) {
      totalResult = await query(`SELECT COUNT(*)::int AS n FROM email_list WHERE subscribed = true AND email IS NOT NULL AND email != ''`)
      newResult = await query(
        `SELECT COUNT(*)::int AS n FROM email_list
         WHERE subscribed = true AND email IS NOT NULL AND email != ''
           AND "createdAt" >= $1::timestamptz AND "createdAt" <= $2::timestamptz`,
        [startStr + 'T00:00:00.000Z', endStr + 'T23:59:59.999Z']
      )
    }
    return {
      totalSubscribers: totalResult?.rows[0] ? Number(totalResult.rows[0].n) : 0,
      newSignups: newResult?.rows[0] ? Number(newResult.rows[0].n) : 0,
    }
  } catch (err) {
    console.error('[Monthly Report Data] Newsletter query failed:', err?.message)
    return {}
  }
}

async function fetchEvents(startStr, endStr) {
  try {
    const result = await query(
      `SELECT event_name, event_date::text AS date_iso, TO_CHAR(event_date, 'Mon DD') AS date_label
       FROM events
       WHERE is_event = true AND event_date >= $1::date AND event_date <= $2::date
       ORDER BY event_date ASC`,
      [startStr, endStr]
    )
    return (result.rows || []).map((r) => ({ name: r.event_name, date_iso: r.date_iso, date_label: r.date_label }))
  } catch (err) {
    console.error('[Monthly Report Data] Events query failed:', err?.message)
    return []
  }
}

async function fetchInventory(startStr, endStr) {
  try {
    const result = await query(
      `SELECT COUNT(*)::int AS log_count, COALESCE(SUM(quantity_change), 0)::int AS net_change
       FROM inventory
       WHERE created_at >= $1::timestamptz AND created_at <= $2::timestamptz`,
      [startStr + 'T00:00:00.000Z', endStr + 'T23:59:59.999Z']
    )
    const row = result.rows[0]
    return { logCount: row ? Number(row.log_count) : 0, netChange: row ? Number(row.net_change) : 0 }
  } catch (err) {
    console.error('[Monthly Report Data] Inventory query failed:', err?.message)
    return {}
  }
}

export async function webHandler(request) {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed. Use GET.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const secret = process.env.MONTHLY_REPORT_DATA_SECRET
  if (!secret) {
    return new Response(JSON.stringify({ success: false, error: 'Report data API not configured.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const url = new URL(request.url)
  const querySecret = url.searchParams.get('secret')
  const headerSecret = request.headers.get('x-monthly-report-secret')
  const provided = querySecret || headerSecret
  if (provided !== secret) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const range = getPreviousMonthRange()
  const [sales, newsletter, events, inventory] = await Promise.all([
    fetchSales(range.startStr, range.endStr),
    fetchNewsletter(range.startStr, range.endStr),
    fetchEvents(range.startStr, range.endStr),
    fetchInventory(range.startStr, range.endStr),
  ])

  const body = {
    success: true,
    monthLabel: range.monthLabel,
    year: range.year,
    dateRange: { start: range.startStr, end: range.endStr },
    sales,
    newsletter,
    events,
    inventory,
  }

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

export default withWebHandler(webHandler)
