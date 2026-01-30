/**
 * POST /api/event-inquiry
 *
 * Forwards Events page inquiries to Make.com webhook.
 * Kept server-side so the Make webhook URL isn't shipped to the browser bundle.
 */

import crypto from 'crypto'
import { withWebHandler } from './_vercelNodeAdapter.js'

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

function buildReplyMailtoHref(payload) {
  const to = String(payload?.email || '').trim()
  if (!to) return null

  const baseSubject = String(payload?.subject || '').trim() || 'Event inquiry'
  const subject = `Re: ${baseSubject}`
  const body = [
    `Hi ${payload?.name || ''},`,
    ``,
    `Thanks for reaching out!`,
    ``,
    `—`,
    `Original inquiry:`,
    `Name: ${payload?.name || ''}`,
    `Email: ${payload?.email || ''}`,
    `Phone: ${payload?.phone || ''}`,
    `Organization: ${payload?.organization || ''}`,
    `Preferred dates: ${payload?.preferredDates || ''}`,
    ``,
    `${payload?.message || ''}`,
    ``,
    payload?.pageUrl ? `Submitted from: ${payload.pageUrl}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  return `mailto:${encodeMailto(to)}?subject=${encodeMailto(subject)}&body=${encodeMailto(body)}`
}

function buildTelHref(payload) {
  const raw = String(payload?.phone || '').trim()
  if (!raw) return null
  const digits = raw.replace(/\D/g, '')
  if (!digits) return null
  // US normalization for tel: strip leading country code "1" if present
  const normalized = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits
  if (normalized.length !== 10) return null
  return `tel:+1${normalized}`
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

function renderInquiryHtml(payload) {
  const title = 'Spiral Groove — Event Inquiry'
  const replyHref = buildReplyMailtoHref(payload)
  const telHref = buildTelHref(payload)
  const safe = {
    id: escapeHtml(payload.id),
    createdAt: escapeHtml(payload.createdAt),
    name: escapeHtml(payload.name),
    email: escapeHtml(payload.email),
    phone: escapeHtml(payload.phone),
    subject: escapeHtml(payload.subject),
    organization: escapeHtml(payload.organization),
    preferredDates: escapeHtml(payload.preferredDates),
    message: escapeHtml(payload.message).replaceAll('\n', '<br/>'),
    pageUrl: escapeHtml(payload.pageUrl),
    userAgent: escapeHtml(payload.userAgent),
  }

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
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
      <div class="header">Event Inquiry Received</div>
      <div class="content">
        <div class="ok">Sent</div>
        <div class="actions">
          ${replyHref ? `<a class="btn" href="${escapeHtml(replyHref)}">Reply</a>` : ''}
          ${telHref ? `<a class="btn secondary" href="${escapeHtml(telHref)}">Call</a>` : ''}
        </div>
        <div class="row"><div class="k">Subject</div><div class="v">${safe.subject || '<span style="opacity:.6">—</span>'}</div></div>
        <div class="row"><div class="k">Name</div><div class="v">${safe.name}</div></div>
        <div class="row"><div class="k">Email</div><div class="v">${safe.email ? `<a href="mailto:${safe.email}">${safe.email}</a>` : '<span style="opacity:.6">—</span>'}</div></div>
        <div class="row"><div class="k">Phone</div><div class="v">${safe.phone ? (telHref ? `<a href="${escapeHtml(telHref)}">${safe.phone}</a>` : safe.phone) : '<span style="opacity:.6">—</span>'}</div></div>
        <div class="row"><div class="k">Organization</div><div class="v">${safe.organization || '<span style="opacity:.6">—</span>'}</div></div>
        <div class="row"><div class="k">Preferred dates</div><div class="v">${safe.preferredDates || '<span style="opacity:.6">—</span>'}</div></div>
        <div class="row"><div class="k">Message</div><div class="v">${safe.message || '<span style="opacity:.6">—</span>'}</div></div>
        <div class="row"><div class="k">Page URL</div><div class="v">${safe.pageUrl ? `<a href="${safe.pageUrl}" target="_blank" rel="noreferrer">${safe.pageUrl}</a>` : '<span style="opacity:.6">—</span>'}</div></div>
        <div class="row"><div class="k">Meta</div><div class="v mono">id=${safe.id}<br/>createdAt=${safe.createdAt}</div></div>
      </div>
    </div>
  </body>
</html>`
}

function renderCustomerCopyHtml(payload) {
  const title = 'Spiral Groove — Your Event Inquiry'
  const safe = {
    createdAt: escapeHtml(payload.createdAt),
    name: escapeHtml(payload.name),
    subject: escapeHtml(payload.subject),
    organization: escapeHtml(payload.organization),
    preferredDates: escapeHtml(payload.preferredDates),
    message: escapeHtml(payload.message).replaceAll('\n', '<br/>'),
  }

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
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
      <div class="header">Copy of your inquiry</div>
      <div class="content">
        <div class="ok">Received</div>
        <p style="margin:0 0 14px 0; font-size:14px;">
          Thanks${safe.name ? `, ${safe.name}` : ''}! Here’s a copy of what you sent. We’ll get back to you soon.
        </p>
        <div class="row"><div class="k">Subject</div><div class="v">${safe.subject || '<span style="opacity:.6">—</span>'}</div></div>
        <div class="row"><div class="k">Organization</div><div class="v">${safe.organization || '<span style="opacity:.6">—</span>'}</div></div>
        <div class="row"><div class="k">Preferred dates</div><div class="v">${safe.preferredDates || '<span style="opacity:.6">—</span>'}</div></div>
        <div class="row"><div class="k">Message</div><div class="v">${safe.message || '<span style="opacity:.6">—</span>'}</div></div>
        <div class="row"><div class="k">Submitted</div><div class="v">${safe.createdAt}</div></div>
      </div>
    </div>
  </body>
</html>`
}

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export async function webHandler(request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed. Use POST.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Invalid JSON body.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const payload = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    source: 'events_page_form',
    name: String(body?.name || '').trim(),
    email: String(body?.email || '').trim(),
    phone: String(body?.phone || '').trim(),
    organization: String(body?.org || '').trim(),
    preferredDates: String(body?.date || '').trim(),
    message: String(body?.message || '').trim(),
    pageUrl: String(body?.pageUrl || '').trim(),
    userAgent: String(body?.userAgent || '').trim(),
    sendCopy: Boolean(body?.sendCopy),
  }
  const replyToEmail = payload.email || ''
  const replyToName = payload.name || ''
  const subject = `Event inquiry${payload.organization ? ` — ${payload.organization}` : payload.name ? ` — ${payload.name}` : ''}`.trim()
  payload.subject = subject
  const html = renderInquiryHtml(payload)
  const customerHtml = renderCustomerCopyHtml(payload)

  if (!payload.name || !payload.message || (!payload.email && !payload.phone)) {
    return new Response(JSON.stringify({ success: false, error: 'Missing required fields.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (payload.phone && !isValidUsPhone(payload.phone)) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid phone number.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const webhookUrl = process.env.MAKE_EVENTS_INQUIRY_WEBHOOK_URL
  if (!webhookUrl) {
    console.error('[Event Inquiry] Missing MAKE_EVENTS_INQUIRY_WEBHOOK_URL')
    return new Response(JSON.stringify({ success: false, error: 'Server not configured for event inquiries.' }), {
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
      console.error('[Event Inquiry] Webhook error', { status: res.status, text: text?.slice?.(0, 200) })
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
    console.error('[Event Inquiry] Webhook request failed:', e)
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

