/**
 * GET /api/newsletter/unsubscribe?email=...&token=...
 *
 * Marks an email as unsubscribed in email_list.
 * Uses a signed token to prevent abuse.
 */

import crypto from 'crypto'
import { withWebHandler } from '../_vercelNodeAdapter.js'
import { query } from '../db.js'

function base64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function timingSafeEqualStr(a, b) {
  const aa = Buffer.from(String(a || ''))
  const bb = Buffer.from(String(b || ''))
  if (aa.length !== bb.length) return false
  return crypto.timingSafeEqual(aa, bb)
}

function getSecret() {
  return process.env.NEWSLETTER_UNSUBSCRIBE_SECRET || process.env.JWT_SECRET || ''
}

function sign(email) {
  const secret = getSecret()
  if (!secret) return null
  const normalized = String(email || '').trim().toLowerCase()
  const mac = crypto.createHmac('sha256', secret).update(normalized).digest()
  return base64url(mac)
}

function renderHtml({ ok, email, message }) {
  const safeEmail = String(email || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const title = ok ? 'Unsubscribed' : 'Unsubscribe failed'
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title} — Spiral Groove</title>
    <style>
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; background:#f7f4ef; color:#111; margin:0; padding:32px; }
      .card { max-width: 720px; margin: 0 auto; background:#fff; border:2px solid #111; box-shadow: 8px 8px 0 #111; }
      .header { padding: 18px 20px; border-bottom:2px solid #111; background:${ok ? '#12b981' : '#f35b04'}; color:#111; font-weight:900; letter-spacing:.08em; text-transform:uppercase; }
      .content { padding: 20px; }
      a { color:#0b5fff; text-decoration:none; }
      a:hover { text-decoration:underline; }
      .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="header">${title}</div>
      <div class="content">
        <p style="margin:0 0 10px 0; font-size:16px; font-weight:700;">${message}</p>
        ${safeEmail ? `<p class="mono" style="margin:0; opacity:.75;">${safeEmail}</p>` : ''}
        <p style="margin:16px 0 0 0; font-size:14px;">
          <a href="https://spiralgrooverecords.com">Return to SpiralGrooveRecords.com</a>
        </p>
      </div>
    </div>
  </body>
</html>`
}

export async function webHandler(request) {
  const url = new URL(request.url)

  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed. Use GET.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const email = (url.searchParams.get('email') || '').trim()
  const token = (url.searchParams.get('token') || '').trim()

  if (!email || !token) {
    const html = renderHtml({ ok: false, email, message: 'Missing unsubscribe parameters.' })
    return new Response(html, { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  }

  const expected = sign(email)
  if (!expected || !timingSafeEqualStr(token, expected)) {
    const html = renderHtml({ ok: false, email, message: 'Invalid or expired unsubscribe link.' })
    return new Response(html, { status: 401, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  }

  try {
    await query(`DELETE FROM email_list WHERE email = $1`, [email])
  } catch (e) {
    console.error('[Unsubscribe] DB error:', e)
    const html = renderHtml({ ok: false, email, message: 'Could not update your subscription. Please try again later.' })
    return new Response(html, { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  }

  const html = renderHtml({ ok: true, email, message: 'You’ve been unsubscribed. No hard feelings.' })
  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}

export const config = { runtime: 'nodejs' }

export default withWebHandler(webHandler)

