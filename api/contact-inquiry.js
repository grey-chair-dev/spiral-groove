/**
 * POST /api/contact-inquiry
 *
 * Forwards Contact inquiries to Make.com webhook.
 * Returns an HTML receipt (admin-style) and provides a customerHtml copy for optional "send me a copy".
 */

import crypto from 'crypto'
import { withWebHandler } from './_vercelNodeAdapter.js'
import { sendSlackAlert } from './slackAlerts.js'

function escapeHtml(input) {
  return String(input || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function encodeMailto(input) {
  return encodeURIComponent(String(input || ''))
}

function normalizeUsPhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '')
  if (!digits) return ''
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1)
  return digits
}

function isValidUsPhone(raw) {
  const digits = normalizeUsPhone(raw)
  return digits.length === 0 || digits.length === 10
}

function buildTelHref(payload) {
  const digits = normalizeUsPhone(payload?.phone)
  if (!digits) return null
  if (digits.length !== 10) return null
  return `tel:+1${digits}`
}

function buildReplyMailtoHref(payload) {
  const to = String(payload?.email || '').trim()
  if (!to) return null
  const baseSubject = String(payload?.subject || '').trim() || 'Contact inquiry'
  const subject = `Re: ${baseSubject}`
  const body = [
    `Hi ${payload?.name || ''},`,
    ``,
    `Thanks for reaching out!`,
    ``,
    `—`,
    `Original message:`,
    `Name: ${payload?.name || ''}`,
    `Email: ${payload?.email || ''}`,
    `Phone: ${payload?.phone || ''}`,
    `Topic: ${payload?.topic || ''}`,
    ``,
    `${payload?.message || ''}`,
    ``,
    payload?.pageUrl ? `Submitted from: ${payload.pageUrl}` : '',
  ]
    .filter(Boolean)
    .join('\n')
  return `mailto:${encodeMailto(to)}?subject=${encodeMailto(subject)}&body=${encodeMailto(body)}`
}

function renderAdminHtml(payload) {
  const replyHref = buildReplyMailtoHref(payload)
  const telHref = buildTelHref(payload)

  const safe = {
    id: escapeHtml(payload.id),
    createdAt: escapeHtml(payload.createdAt),
    name: escapeHtml(payload.name),
    email: escapeHtml(payload.email),
    phone: escapeHtml(payload.phone),
    subject: escapeHtml(payload.subject),
    topic: escapeHtml(payload.topic),
    message: escapeHtml(payload.message).replaceAll('\n', '<br/>'),
    pageUrl: escapeHtml(payload.pageUrl),
  }

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Spiral Groove — Contact Inquiry</title>
    <style>
      :root { color-scheme: light; }
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; background:#f7f4ef; color:#111; margin:0; padding:32px; }
      .card { max-width: 760px; margin: 0 auto; background:#fff; border:2px solid #111; box-shadow: 8px 8px 0 #111; }
      .header { padding: 18px 20px; border-bottom:2px solid #111; background:#f1b23e; font-weight:900; letter-spacing:.08em; text-transform:uppercase; }
      .content { padding: 20px; }
      .row { display:flex; gap:16px; padding:10px 0; border-bottom:1px dashed #ddd; }
      .row:last-child { border-bottom:0; }
      .k { width: 160px; flex-shrink:0; font-weight:800; text-transform:uppercase; font-size:12px; opacity:.75; letter-spacing:.08em; }
      .v { flex:1; font-size:14px; line-height:1.5; word-break:break-word; }
      .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
      a { color:#0b5fff; text-decoration:none; }
      a:hover { text-decoration:underline; }
      .ok { display:inline-block; margin: 0 0 14px 0; padding: 6px 10px; border:2px solid #111; background:#12b981; color:#111; font-weight:900; text-transform:uppercase; font-size:12px; letter-spacing:.08em; }
      .actions { display:flex; flex-wrap:wrap; gap:10px; margin: 6px 0 14px 0; }
      .btn { display:inline-block; padding:10px 14px; border:2px solid #111; background:#111; color:#fff !important; font-weight:900; text-transform:uppercase; font-size:12px; letter-spacing:.08em; }
      .btn:hover { opacity:.9; text-decoration:none; }
      .btn.secondary { background:#fff; color:#111 !important; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="header">Contact Inquiry Received</div>
      <div class="content">
        <div class="ok">Sent</div>
        <div class="actions">
          ${replyHref ? `<a class="btn" href="${escapeHtml(replyHref)}">Reply</a>` : ''}
          ${telHref ? `<a class="btn secondary" href="${escapeHtml(telHref)}">Call</a>` : ''}
        </div>
        <div class="row"><div class="k">Subject</div><div class="v">${safe.subject}</div></div>
        <div class="row"><div class="k">Name</div><div class="v">${safe.name}</div></div>
        <div class="row"><div class="k">Email</div><div class="v">${safe.email ? `<a href="mailto:${safe.email}">${safe.email}</a>` : '<span style="opacity:.6">—</span>'}</div></div>
        <div class="row"><div class="k">Phone</div><div class="v">${safe.phone ? (telHref ? `<a href="${escapeHtml(telHref)}">${safe.phone}</a>` : safe.phone) : '<span style="opacity:.6">—</span>'}</div></div>
        <div class="row"><div class="k">Topic</div><div class="v">${safe.topic || '<span style="opacity:.6">—</span>'}</div></div>
        <div class="row"><div class="k">Message</div><div class="v">${safe.message}</div></div>
        <div class="row"><div class="k">Page URL</div><div class="v">${safe.pageUrl ? `<a href="${safe.pageUrl}" target="_blank" rel="noreferrer">${safe.pageUrl}</a>` : '<span style="opacity:.6">—</span>'}</div></div>
        <div class="row"><div class="k">Meta</div><div class="v mono">id=${safe.id}<br/>createdAt=${safe.createdAt}</div></div>
      </div>
    </div>
  </body>
</html>`
}

function renderCustomerHtml(payload) {
  const safe = {
    createdAt: escapeHtml(payload.createdAt),
    name: escapeHtml(payload.name),
    subject: escapeHtml(payload.subject),
    topic: escapeHtml(payload.topic),
    message: escapeHtml(payload.message).replaceAll('\n', '<br/>'),
  }

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Spiral Groove — Your Message</title>
    <style>
      :root { color-scheme: light; }
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; background:#f7f4ef; color:#111; margin:0; padding:32px; }
      .card { max-width: 760px; margin: 0 auto; background:#fff; border:2px solid #111; box-shadow: 8px 8px 0 #111; }
      .header { padding: 18px 20px; border-bottom:2px solid #111; background:#0ea5a4; color:#fff; font-weight:900; letter-spacing:.08em; text-transform:uppercase; }
      .content { padding: 20px; }
      .row { display:flex; gap:16px; padding:10px 0; border-bottom:1px dashed #ddd; }
      .row:last-child { border-bottom:0; }
      .k { width: 160px; flex-shrink:0; font-weight:800; text-transform:uppercase; font-size:12px; opacity:.75; letter-spacing:.08em; }
      .v { flex:1; font-size:14px; line-height:1.5; word-break:break-word; }
      .ok { display:inline-block; margin: 0 0 14px 0; padding: 6px 10px; border:2px solid #111; background:#12b981; color:#111; font-weight:900; text-transform:uppercase; font-size:12px; letter-spacing:.08em; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="header">Copy of your message</div>
      <div class="content">
        <div class="ok">Received</div>
        <p style="margin:0 0 14px 0; font-size:14px;">
          Thanks${safe.name ? `, ${safe.name}` : ''}! Here’s a copy of what you sent.
        </p>
        <div class="row"><div class="k">Subject</div><div class="v">${safe.subject || '<span style="opacity:.6">—</span>'}</div></div>
        <div class="row"><div class="k">Topic</div><div class="v">${safe.topic || '<span style="opacity:.6">—</span>'}</div></div>
        <div class="row"><div class="k">Message</div><div class="v">${safe.message}</div></div>
        <div class="row"><div class="k">Submitted</div><div class="v">${safe.createdAt}</div></div>
      </div>
    </div>
  </body>
</html>`
}

export async function webHandler(request) {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()
  const userAgent = request.headers.get('user-agent') || ''
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const url = new URL(request.url)
  
  // Extract request context
  const requestHeaders = {}
  const relevantHeaders = ['user-agent', 'referer', 'origin', 'content-type', 'accept']
  for (const header of relevantHeaders) {
    const value = request.headers.get(header)
    if (value) requestHeaders[header] = value
  }
  
  const queryParams = {}
  for (const [key, value] of url.searchParams.entries()) {
    queryParams[key] = value
  }

  if (request.method !== 'POST') {
    void sendSlackAlert({
      statusCode: 405,
      error: 'Method not allowed. Use POST.',
      endpoint: '/api/contact-inquiry',
      method: request.method,
      requestId,
      userAgent,
      ip,
      requestHeaders: Object.keys(requestHeaders).length > 0 ? requestHeaders : undefined,
      queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
      dedupeKey: `contact-inquiry:405:${request.method}`,
    })
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed. Use POST.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let body
  let requestBody = null
  try {
    body = await request.json()
    // Sanitize sensitive fields for alerting
    requestBody = { ...body }
    if (requestBody.email) requestBody.email = '[REDACTED]'
    if (requestBody.phone) requestBody.phone = '[REDACTED]'
  } catch {
    void sendSlackAlert({
      statusCode: 400,
      error: 'Invalid JSON body.',
      endpoint: '/api/contact-inquiry',
      method: 'POST',
      requestId,
      userAgent,
      ip,
      requestHeaders: Object.keys(requestHeaders).length > 0 ? requestHeaders : undefined,
      queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
      dedupeKey: `contact-inquiry:400:invalid-json`,
    })
    return new Response(JSON.stringify({ success: false, error: 'Invalid JSON body.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const payload = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    source: 'contact_us_form',
    name: String(body?.name || '').trim(),
    email: String(body?.email || '').trim(),
    phone: String(body?.phone || '').trim(),
    topic: String(body?.topic || body?.subject || '').trim(),
    message: String(body?.message || '').trim(),
    pageUrl: String(body?.pageUrl || '').trim(),
    userAgent: String(body?.userAgent || '').trim(),
    sendCopy: Boolean(body?.sendCopy),
    screenshot: body?.screenshot || undefined, // Screenshot from frontend (base64)
  }

  if (payload.topic.toLowerCase() === 'personal') {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Personal messages are handled via Instagram DM.',
        dmUrl: 'https://ig.me/m/spiral_groove_records_',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  if (!payload.name || !payload.message || (!payload.email && !payload.phone)) {
    const responseTime = Date.now() - startTime
    void sendSlackAlert({
      statusCode: 400,
      error: 'Missing required fields.',
      endpoint: '/api/contact-inquiry',
      method: 'POST',
      requestId,
      userAgent,
      ip,
      responseTime,
      requestBody,
      requestHeaders: Object.keys(requestHeaders).length > 0 ? requestHeaders : undefined,
      queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
      context: { name: payload.name, hasEmail: !!payload.email, hasPhone: !!payload.phone },
      screenshot: payload.screenshot, // Include screenshot if available
      dedupeKey: `contact-inquiry:400:missing-fields`,
    })
    return new Response(JSON.stringify({ success: false, error: 'Missing required fields.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  if (payload.phone && !isValidUsPhone(payload.phone)) {
    const responseTime = Date.now() - startTime
    void sendSlackAlert({
      statusCode: 400,
      error: 'Invalid phone number.',
      endpoint: '/api/contact-inquiry',
      method: 'POST',
      requestId,
      userAgent,
      ip,
      responseTime,
      requestBody,
      requestHeaders: Object.keys(requestHeaders).length > 0 ? requestHeaders : undefined,
      queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
      context: { phone: '[REDACTED]' }, // Don't log actual phone number
      dedupeKey: `contact-inquiry:400:invalid-phone`,
    })
    return new Response(JSON.stringify({ success: false, error: 'Invalid phone number.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const replyToEmail = payload.email || ''
  const replyToName = payload.name || ''
  const subject = `Contact inquiry${payload.topic ? ` — ${payload.topic}` : ''}${payload.name ? ` — ${payload.name}` : ''}`.trim()
  payload.subject = subject

  const html = renderAdminHtml(payload)
  const customerHtml = renderCustomerHtml(payload)

  const webhookUrl = process.env.MAKE_CONTACT_US_WEBHOOK_URL || process.env.MAKE_CONTACT_INQUIRY_WEBHOOK_URL
  if (!webhookUrl) {
    console.error('[Contact Inquiry] Missing MAKE_CONTACT_US_WEBHOOK_URL (or MAKE_CONTACT_INQUIRY_WEBHOOK_URL)')
    const responseTime = Date.now() - startTime
    void sendSlackAlert({
      statusCode: 500,
      error: 'Server not configured for contact inquiries.',
      endpoint: '/api/contact-inquiry',
      method: 'POST',
      requestId,
      userAgent,
      ip,
      responseTime,
      requestBody,
      requestHeaders: Object.keys(requestHeaders).length > 0 ? requestHeaders : undefined,
      queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
      context: { missingWebhook: true },
      dedupeKey: `contact-inquiry:500:missing-webhook`,
    })
    return new Response(JSON.stringify({ success: false, error: 'Server not configured for contact inquiries.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, replyToEmail, replyToName, subject, html, customerHtml }),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      console.error('[Contact Inquiry] Webhook error', { status: res.status, text: text?.slice?.(0, 200) })
      const responseTime = Date.now() - startTime
      void sendSlackAlert({
        statusCode: 502,
        error: 'Failed to submit inquiry - webhook error',
        endpoint: '/api/contact-inquiry',
        method: 'POST',
        requestId,
        userAgent,
        ip,
        responseTime,
        requestBody,
        requestHeaders: Object.keys(requestHeaders).length > 0 ? requestHeaders : undefined,
        queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
        context: { webhookStatus: res.status, webhookError: text?.slice?.(0, 200) },
        dedupeKey: `contact-inquiry:502:webhook-${res.status}`,
      })
      const details =
        process.env.NODE_ENV === 'production'
          ? undefined
          : { status: res.status, body: (text || '').slice(0, 500) }
      return new Response(JSON.stringify({ success: false, error: 'Failed to submit inquiry.', details }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  } catch (e) {
    console.error('[Contact Inquiry] Webhook request failed:', e)
    const responseTime = Date.now() - startTime
    void sendSlackAlert({
      statusCode: 502,
      error: 'Failed to submit inquiry - exception',
      endpoint: '/api/contact-inquiry',
      method: 'POST',
      requestId,
      userAgent,
      ip,
      responseTime,
      requestBody,
      requestHeaders: Object.keys(requestHeaders).length > 0 ? requestHeaders : undefined,
      queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
      context: { exception: e?.message || String(e) },
      stack: e?.stack,
      dedupeKey: `contact-inquiry:502:exception`,
    })
    const details =
      process.env.NODE_ENV === 'production'
        ? undefined
        : { message: e?.message || String(e) }
    return new Response(JSON.stringify({ success: false, error: 'Failed to submit inquiry.', details }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const config = {
  runtime: 'nodejs',
}

export default withWebHandler(webHandler)

