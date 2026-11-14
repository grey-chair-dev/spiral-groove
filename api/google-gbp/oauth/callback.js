/**
 * GET /api/google-gbp/oauth/callback
 * Exchanges ?code= for tokens. Shows refresh_token once in HTML (copy into .env.local).
 */
import { withWebHandler } from '../../_vercelNodeAdapter.js'

export const config = { runtime: 'nodejs' }

function htmlPage(title, bodyHtml) {
  return new Response(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
<style>
body{font-family:ui-sans-serif,system-ui,sans-serif;max-width:640px;margin:40px auto;padding:0 16px;line-height:1.5}
code,pre{background:#f4f4f5;padding:2px 6px;border-radius:4px;word-break:break-all}
pre{padding:12px;overflow:auto}
.ok{color:#166534}.err{color:#991b1b}
</style></head><body>${bodyHtml}</body></html>`,
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  )
}

export async function webHandler(request) {
  if ((request.method || 'GET').toUpperCase() !== 'GET') {
    return htmlPage('OAuth error', '<p class="err">Method not allowed</p>')
  }

  const url = new URL(request.url)
  const err = url.searchParams.get('error')
  if (err) {
    return htmlPage('OAuth error', `<p class="err">Google error: ${escapeHtml(err)}</p>`)
  }

  const code = url.searchParams.get('code')
  if (!code) {
    return htmlPage('OAuth', '<p class="err">Missing code. Start from <code>/api/google-gbp/oauth/start</code>.</p>')
  }

  const clientId = process.env.GOOGLE_GBP_CLIENT_ID
  const clientSecret = process.env.GOOGLE_GBP_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return htmlPage(
      'OAuth error',
      '<p class="err">Set <code>GOOGLE_GBP_CLIENT_ID</code> and <code>GOOGLE_GBP_CLIENT_SECRET</code> in env.</p>',
    )
  }

  let redirectUri = process.env.GOOGLE_GBP_OAUTH_REDIRECT_URI || `${url.origin}/api/google-gbp/oauth/callback`
  const stateRaw = url.searchParams.get('state')
  if (stateRaw) {
    try {
      const state = JSON.parse(Buffer.from(stateRaw, 'base64url').toString('utf8'))
      if (state.redirect_uri) redirectUri = state.redirect_uri
    } catch {
      // ignore bad state
    }
  }

  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  })

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    signal: AbortSignal.timeout(20_000),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    return htmlPage(
      'OAuth error',
      `<p class="err">Token exchange failed (${res.status}).</p><pre>${escapeHtml(JSON.stringify(json, null, 2))}</pre>`,
    )
  }

  const refresh = json.refresh_token
  const access = json.access_token
  if (!refresh) {
    return htmlPage(
      'OAuth',
      `<p class="err">No <code>refresh_token</code> in response (Google only returns it on first consent). Revoke app access at
      <a href="https://myaccount.google.com/permissions">Google Account permissions</a>, then retry with <code>prompt=consent</code>.</p>
      <pre>${escapeHtml(JSON.stringify({ ...json, access_token: access ? '[redacted]' : null }, null, 2))}</pre>`,
    )
  }

  return htmlPage(
    'GBP OAuth success',
    `<h1 class="ok">Refresh token ready</h1>
<p>Add these to <code>.env.local</code> and Vercel (never commit):</p>
<pre>GOOGLE_GBP_CLIENT_ID=${escapeHtml(clientId)}
GOOGLE_GBP_CLIENT_SECRET=[already set]
GOOGLE_GBP_REFRESH_TOKEN=${escapeHtml(refresh)}</pre>
<p>Then say <strong>ready</strong> in chat so we can smoke-test list reviews.</p>
<p>You can close this tab. Do not share the refresh token.</p>`,
  )
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export default withWebHandler(webHandler)
