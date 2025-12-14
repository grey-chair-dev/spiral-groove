import { notifyWebhook } from '../notifyWebhook.js'

export default async function handler(request) {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed. Use GET.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Safety: require a token in production to avoid a public endpoint that can spam your automation.
  // Set MAKE_WEBHOOK_TEST_TOKEN in Vercel env vars and call:
  //   /api/webhook/test?token=...
  if (process.env.NODE_ENV === 'production') {
    const url = new URL(request.url)
    const token = url.searchParams.get('token') || ''
    const expected = process.env.MAKE_WEBHOOK_TEST_TOKEN || ''
    if (!expected || token !== expected) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  const id = crypto.randomUUID()
  await notifyWebhook({
    event: 'test.webhook',
    title: '✅ Spiral Groove webhook test',
    message: 'Manual test ping from /api/webhook/test',
    context: { id },
    dedupeKey: `test:${id}`,
    dedupeTtlMs: 0,
  })

  return new Response(JSON.stringify({ success: true, sent: true, id }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}


