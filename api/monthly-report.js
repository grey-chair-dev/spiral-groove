/**
 * Monthly business owner report
 *
 * Vercel Cron endpoint that runs on the 1st of each month. Aggregates sales,
 * newsletter, events, inventory, and Google Analytics (GA4) for the previous
 * calendar month and emails an HTML report to the business owner.
 *
 * Cron schedule: vercel.json (e.g. 0 8 1 * * = 1st of month at 8:00 UTC)
 *
 * Env: MONTHLY_REPORT_RECIPIENTS or REPORT_EMAIL (comma-separated),
 *      MONTHLY_REPORT_FROM (optional; default projects@greychair.io),
 *      GA4_PROPERTY_ID (numeric), GA4_SERVICE_ACCOUNT_JSON or GA4_SERVICE_ACCOUNT_PATH (local file) for GA.
 */

import { withWebHandler } from './_vercelNodeAdapter.js'
import { query } from './db.js'
import { sendEmail } from './sendEmail.js'
import fs from 'fs'
import path from 'path'
import os from 'os'

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
  const monthLabel = monthNames[firstDay.getUTCMonth()]
  const monthYear = firstDay.getUTCFullYear()
  return {
    start: firstDay,
    end: lastDay,
    startStr: firstDay.toISOString().slice(0, 10),
    endStr: lastDay.toISOString().slice(0, 10),
    monthLabel,
    year: monthYear,
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
    return {
      orderCount: row ? Number(row.order_count) : 0,
      revenueCents: row ? Number(row.revenue_cents) : 0,
    }
  } catch (err) {
    console.error('[Monthly Report] Sales query failed:', err?.message)
    return {}
  }
}

async function fetchNewsletter(startStr, endStr) {
  try {
    let totalResult
    let newResult
    try {
      totalResult = await query(
        `SELECT COUNT(*)::int AS n FROM email_list WHERE subscribed = TRUE AND email IS NOT NULL AND email != ''`
      )
      newResult = await query(
        `SELECT COUNT(*)::int AS n FROM email_list
         WHERE subscribed = TRUE AND email IS NOT NULL AND email != ''
           AND created_at >= $1::timestamptz AND created_at <= $2::timestamptz`,
        [startStr + 'T00:00:00.000Z', endStr + 'T23:59:59.999Z']
      )
    } catch (e) {
      try {
        totalResult = await query(
          `SELECT COUNT(*)::int AS n FROM email_list WHERE subscribed = true AND email IS NOT NULL AND email != ''`
        )
        newResult = await query(
          `SELECT COUNT(*)::int AS n FROM email_list
           WHERE subscribed = true AND email IS NOT NULL AND email != ''
             AND "createdAt" >= $1::timestamptz AND "createdAt" <= $2::timestamptz`,
          [startStr + 'T00:00:00.000Z', endStr + 'T23:59:59.999Z']
        )
      } catch (e2) {
        throw e
      }
    }
    return {
      totalSubscribers: totalResult?.rows[0] ? Number(totalResult.rows[0].n) : 0,
      newSignups: newResult?.rows[0] ? Number(newResult.rows[0].n) : 0,
    }
  } catch (err) {
    console.error('[Monthly Report] Newsletter query failed:', err?.message)
    return {}
  }
}

async function fetchEvents(startStr, endStr) {
  try {
    const result = await query(
      `SELECT event_name, event_date::text AS date_iso, TO_CHAR(event_date, 'Mon DD') AS date_label
       FROM events
       WHERE is_event = true
         AND event_date >= $1::date AND event_date <= $2::date
       ORDER BY event_date ASC`,
      [startStr, endStr]
    )
    return (result.rows || []).map((r) => ({
      name: r.event_name,
      date_iso: r.date_iso,
      date_label: r.date_label,
    }))
  } catch (err) {
    console.error('[Monthly Report] Events query failed:', err?.message)
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
    return {
      logCount: row ? Number(row.log_count) : 0,
      netChange: row ? Number(row.net_change) : 0,
    }
  } catch (err) {
    console.error('[Monthly Report] Inventory query failed:', err?.message)
    return {}
  }
}

async function fetchGA4(startStr, endStr) {
  const propertyId = process.env.GA4_PROPERTY_ID
  let jsonCreds = process.env.GA4_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
  // Local dev: load from file path so you don't have to paste JSON into .env
  if (!jsonCreds && process.env.GA4_SERVICE_ACCOUNT_PATH) {
    const keyPath = path.resolve(process.cwd(), process.env.GA4_SERVICE_ACCOUNT_PATH)
    if (fs.existsSync(keyPath)) {
      jsonCreds = fs.readFileSync(keyPath, 'utf8')
    }
  }
  if (!propertyId) {
    return null
  }
  try {
    if (jsonCreds && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      const tmpPath = path.join(os.tmpdir(), `ga4-sa-${Date.now()}.json`)
      fs.writeFileSync(tmpPath, jsonCreds, 'utf8')
      process.env.GOOGLE_APPLICATION_CREDENTIALS = tmpPath
    }
    const { BetaAnalyticsDataClient } = await import('@google-analytics/data')
    const client = new BetaAnalyticsDataClient()
    const [metricsResponse] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: startStr, endDate: endStr }],
      dimensions: [],
      metrics: [
        { name: 'sessions' },
        { name: 'activeUsers' },
        { name: 'screenPageViews' },
      ],
    })
    let sessions = 0
    let users = 0
    let pageViews = 0
    if (metricsResponse?.rows?.[0]?.metricValues) {
      const v = metricsResponse.rows[0].metricValues
      sessions = Number(v[0]?.value || 0)
      users = Number(v[1]?.value || 0)
      pageViews = Number(v[2]?.value || 0)
    }
    const [pagesResponse] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: startStr, endDate: endStr }],
      dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
      metrics: [{ name: 'screenPageViews' }],
      limit: 10,
    })
    const topPages = (pagesResponse?.rows || []).map((row) => ({
      path: row.dimensionValues?.[0]?.value || '',
      title: row.dimensionValues?.[1]?.value || '',
      views: Number(row.metricValues?.[0]?.value || 0),
    }))
    return { sessions, users, pageViews, topPages }
  } catch (err) {
    console.error('[Monthly Report] GA4 fetch failed:', err?.message)
    return null
  }
}

export async function webHandler(request) {
  const method = (request.method || 'GET').toUpperCase()
  const userAgent = request.headers.get('user-agent') || ''
  const xVercelCron = request.headers.get('x-vercel-cron')
  const isVercelCron = Boolean(xVercelCron) || /vercel[-\s]?cron/i.test(userAgent)

  if (method !== 'GET') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed. Use GET (cron).' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    )
  }
  if (process.env.NODE_ENV === 'production' && !isVercelCron) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized. This endpoint is for Vercel cron only.' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const recipientsRaw = process.env.MONTHLY_REPORT_RECIPIENTS || process.env.REPORT_EMAIL || ''
  const recipients = recipientsRaw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  if (recipients.length === 0) {
    console.warn('[Monthly Report] No recipients configured (MONTHLY_REPORT_RECIPIENTS or REPORT_EMAIL)')
    return new Response(
      JSON.stringify({ success: false, error: 'No report recipients configured.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const range = getPreviousMonthRange()
  const { startStr, endStr, monthLabel, year } = range

  const [sales, newsletter, events, inventory, ga] = await Promise.all([
    fetchSales(startStr, endStr),
    fetchNewsletter(startStr, endStr),
    fetchEvents(startStr, endStr),
    fetchInventory(startStr, endStr),
    fetchGA4(startStr, endStr),
  ])

  const reportData = {
    monthLabel,
    year,
    sales,
    newsletter,
    events,
    inventory,
    ga,
  }

  let sent = 0
  for (const to of recipients) {
    const result = await sendEmail({
      type: 'monthly_report',
      to,
      data: reportData,
      force: true,
    })
    if (result.attempted && result.ok) sent++
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: `Report sent for ${monthLabel} ${year}`,
      dateRange: { start: startStr, end: endStr },
      recipientsSent: sent,
      recipientsTotal: recipients.length,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}

export default withWebHandler(webHandler)
