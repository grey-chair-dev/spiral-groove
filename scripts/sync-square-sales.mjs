import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config()

// Reuse the serverless handler logic by calling the underlying endpoint locally.
// This runs a backfill by default (last 365 days, or from last sync).
const url = 'http://localhost/api/square/sales-sync'

console.log('[sync:sales] Starting Square → Neon sales sync (local)…')
const startedAt = Date.now()

try {
  // Import the handler directly to avoid requiring a running server.
  const mod = await import('../api/square/sales-sync.js')
  const { webHandler } = mod

  const req = new Request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  })

  const res = await webHandler(req)
  const text = await res.text()
  const ms = Date.now() - startedAt
  console.log('[sync:sales] Response', { status: res.status, durationMs: ms })
  console.log(text)
  process.exit(res.ok ? 0 : 1)
} catch (e) {
  console.error('[sync:sales] ❌ Failed:', e?.message || e)
  process.exit(1)
}

