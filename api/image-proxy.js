/**
 * GET /api/image-proxy?url=https%3A%2F%2F...
 *
 * Best-effort image proxy for third-party images that block direct hotlinking (e.g. Instagram CDN).
 * This handler always returns an **image** (either the upstream image, or an inline SVG placeholder)
 * so <img> tags don't spam the console with failed requests.
 */
import { withWebHandler } from './_vercelNodeAdapter.js'
import { query } from './db.js'

export const config = { runtime: 'nodejs' }

const MAX_IMAGE_BYTES = 8 * 1024 * 1024 // 8MB
const CACHE_TTL_DAYS = 30
let didEnsureCacheSchema = false

async function ensureCacheSchema() {
  if (didEnsureCacheSchema) return
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS image_cache (
        url TEXT PRIMARY KEY,
        content_type TEXT NOT NULL,
        body BYTEA NOT NULL,
        fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)
    await query(`
      CREATE INDEX IF NOT EXISTS idx_image_cache_fetched_at_desc
      ON image_cache (fetched_at DESC)
    `)
  } finally {
    didEnsureCacheSchema = true
  }
}

function svgPlaceholder(label = 'Image unavailable') {
  const safe = String(label).replace(/[<>&"]/g, '')
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <rect width="600" height="600" fill="#F3F4F6"/>
  <rect x="40" y="40" width="520" height="520" fill="none" stroke="#111827" stroke-width="6"/>
  <text x="300" y="315" text-anchor="middle" font-family="ui-sans-serif, system-ui" font-size="22" fill="#111827">${safe}</text>
</svg>`
}

function placeholderResponse(label, extraHeaders = {}) {
  return new Response(svgPlaceholder(label), {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
      ...extraHeaders,
    },
  })
}

function isBlockedHostname(hostname) {
  const h = String(hostname || '').toLowerCase()
  if (!h) return true
  if (h === 'localhost' || h.endsWith('.localhost')) return true
  if (h === '127.0.0.1' || h === '0.0.0.0') return true
  if (h === '::1') return true
  if (/^10\./.test(h)) return true
  if (/^192\.168\./.test(h)) return true
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(h)) return true
  if (/^169\.254\./.test(h)) return true
  return false
}

function isAllowedHost(hostname) {
  const h = String(hostname || '').toLowerCase()
  const allowSuffixes = ['cdninstagram.com', 'fbcdn.net', 'instagram.com']
  return allowSuffixes.some((s) => h === s || h.endsWith(`.${s}`))
}

export async function webHandler(request) {
  if ((request.method || 'GET').toUpperCase() !== 'GET') {
    return placeholderResponse('Method not allowed', { 'X-Image-Proxy-Error': 'method_not_allowed' })
  }

  const u = new URL(request.url)
  const raw = u.searchParams.get('url') || ''
  if (!raw) return placeholderResponse('Missing url', { 'X-Image-Proxy-Error': 'missing_url' })

  let target
  try {
    target = new URL(raw)
  } catch {
    return placeholderResponse('Bad url', { 'X-Image-Proxy-Error': 'bad_url' })
  }

  if (target.protocol !== 'http:' && target.protocol !== 'https:') {
    return placeholderResponse('Bad protocol', { 'X-Image-Proxy-Error': 'bad_protocol' })
  }
  if (isBlockedHostname(target.hostname) || !isAllowedHost(target.hostname)) {
    return placeholderResponse('Blocked host', { 'X-Image-Proxy-Error': 'blocked_host' })
  }

  try {
    await ensureCacheSchema()

    // Serve from cache if present and fresh enough
    try {
      const cached = await query(
        `SELECT content_type, body, fetched_at
         FROM image_cache
         WHERE url = $1
         LIMIT 1`,
        [target.toString()]
      )
      const row = cached?.rows?.[0]
      if (row?.body && row?.content_type) {
        const fetchedAt = row.fetched_at ? new Date(row.fetched_at).getTime() : 0
        const ageMs = fetchedAt ? Date.now() - fetchedAt : Number.POSITIVE_INFINITY
        const isFresh = ageMs < CACHE_TTL_DAYS * 24 * 60 * 60 * 1000
        if (isFresh) {
          return new Response(row.body, {
            status: 200,
            headers: {
              'Content-Type': row.content_type,
              'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
              'X-Image-Proxy': 'HIT',
            },
          })
        }
      }
    } catch {
      // ignore cache errors
    }

    const upstream = await fetch(target.toString(), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'image/avif,image/webp,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        DNT: '1',
        Referer: 'https://www.instagram.com/',
        Origin: 'https://www.instagram.com',
        // This header is commonly present on Instagram web requests and can help with some CDN gating.
        'X-IG-App-ID': '936619743392459',
        // Hint "image" fetch context (best-effort)
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'same-site',
      },
    })

    if (!upstream.ok) {
      return placeholderResponse(`Upstream ${upstream.status}`, { 'X-Image-Proxy-Error': `upstream_${upstream.status}` })
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream'
    const buf = Buffer.from(await upstream.arrayBuffer())
    if (buf.length > MAX_IMAGE_BYTES) {
      return placeholderResponse('Too large', { 'X-Image-Proxy-Error': 'too_large' })
    }

    // Cache in Neon (best-effort)
    try {
      await query(
        `INSERT INTO image_cache (url, content_type, body, fetched_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (url) DO UPDATE
         SET content_type = EXCLUDED.content_type,
             body = EXCLUDED.body,
             fetched_at = NOW()`,
        [target.toString(), contentType, buf]
      )
    } catch {
      // ignore cache write errors
    }

    return new Response(buf, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
        'X-Image-Proxy': 'MISS',
      },
    })
  } catch {
    return placeholderResponse('Fetch failed', { 'X-Image-Proxy-Error': 'fetch_failed' })
  }
}

export default withWebHandler(webHandler)

