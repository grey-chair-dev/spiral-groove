/**
 * GET /api/google-gbp/oauth/start
 * One-time setup: redirects to Google consent for business.manage.
 * Prod: require ?secret=WEBHOOK_SECRET (or GOOGLE_REVIEW_REPLY_SECRET).
 * Query: redirect_uri override optional (must match OAuth client).
 */
import { withWebHandler } from '../../_vercelNodeAdapter.js'

export const config = { runtime: 'nodejs' }

const SCOPE = 'https://www.googleapis.com/auth/business.manage'

function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

function expectedSecret() {
  return process.env.GOOGLE_REVIEW_REPLY_SECRET || process.env.WEBHOOK_SECRET || ''
}

function authorized(request) {
  if (process.env.NODE_ENV !== 'production') return true
  const expected = expectedSecret()
  if (!expected) return false
  const url = new URL(request.url)
  return url.searchParams.get('secret') === expected
}

function defaultRedirectUri(request) {
  if (process.env.GOOGLE_GBP_OAUTH_REDIRECT_URI) {
    return String(process.env.GOOGLE_GBP_OAUTH_REDIRECT_URI).trim()
  }
  const url = new URL(request.url)
  return `${url.origin}/api/google-gbp/oauth/callback`
}

export async function webHandler(request) {
  if ((request.method || 'GET').toUpperCase() !== 'GET') {
    return json(405, { success: false, error: 'Method not allowed' })
  }
  if (!authorized(request)) return json(401, { success: false, error: 'Unauthorized' })

  const clientId = process.env.GOOGLE_GBP_CLIENT_ID
  if (!clientId) {
    return json(503, {
      success: false,
      error: 'Set GOOGLE_GBP_CLIENT_ID (and SECRET) in .env.local first',
    })
  }

  const url = new URL(request.url)
  const redirectUri = String(url.searchParams.get('redirect_uri') || defaultRedirectUri(request)).trim()
  const auth = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  auth.searchParams.set('client_id', clientId)
  auth.searchParams.set('redirect_uri', redirectUri)
  auth.searchParams.set('response_type', 'code')
  auth.searchParams.set('scope', SCOPE)
  auth.searchParams.set('access_type', 'offline')
  auth.searchParams.set('prompt', 'consent')
  // Pass redirect_uri through state so callback uses the same one
  auth.searchParams.set('state', Buffer.from(JSON.stringify({ redirect_uri: redirectUri }), 'utf8').toString('base64url'))

  return Response.redirect(auth.toString(), 302)
}

export default withWebHandler(webHandler)
