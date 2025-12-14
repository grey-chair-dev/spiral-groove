/**
 * Vercel Node Serverless adapter
 *
 * Your API handlers are written as Web Request -> Web Response functions (like Fetch).
 * Vercel Node functions invoke (req, res). This wraps the Web handler so it runs on Vercel.
 */
import { Buffer } from 'buffer'

async function readBody(req) {
  return await new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function toHeaders(nodeHeaders) {
  const h = new Headers()
  for (const [k, v] of Object.entries(nodeHeaders || {})) {
    if (typeof v === 'undefined') continue
    if (Array.isArray(v)) h.set(k, v.join(','))
    else h.set(k, String(v))
  }
  return h
}

export function withWebHandler(webHandler) {
  return async function vercelNodeHandler(req, res) {
    try {
      const proto = (req.headers['x-forwarded-proto'] || 'https').toString()
      const host = (req.headers['x-forwarded-host'] || req.headers.host || 'localhost').toString()
      const url = `${proto}://${host}${req.url}`

      const method = req.method || 'GET'
      const headers = toHeaders(req.headers)

      let body
      if (!['GET', 'HEAD'].includes(method.toUpperCase())) {
        const buf = await readBody(req)
        if (buf.length) body = buf
      }

      const request = new Request(url, { method, headers, body })
      const response = await webHandler(request)

      res.statusCode = response.status
      response.headers.forEach((value, key) => res.setHeader(key, value))
      const ab = await response.arrayBuffer()
      res.end(Buffer.from(ab))
    } catch (e) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ success: false, error: 'Server error', details: e?.message }))
    }
  }
}


