#!/usr/bin/env node
/**
 * Tests for the code that replaced the Make.com scenarios (no network, no DB).
 * Run: node --test scripts/make-replacement.test.mjs
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'

process.env.MAIL_DRY_RUN = '1'
process.env.SGR_SMTP_URL = 'smtps://user:pass@smtp.example.com:465'
process.env.EMAIL_SUPPRESS_TO = 'test-inbox@example.com'

const { handleInventoryCountUpdated, handleOrderFulfillmentUpdated } = await import('../api/_lib/squareEvents.js')
const {
  refreshStaffPicks,
  createCompleter,
  resolveLlmProvider,
  classifyLlmFailure,
  LlmProviderError,
} = await import('../api/_lib/staffPicks.js')
const { sendEmail } = await import('../api/sendEmail.js')
const { buildFrom } = await import('../api/_lib/mailer.js')

function fakeQuery(answer = () => ({ rows: [], rowCount: 0 })) {
  const calls = []
  const query = async (sql, params = []) => {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params })
    return answer(sql, params)
  }
  return { query, calls }
}

// ---------- Square: inventory ----------

test('inventory: only IN_STOCK counts, logs change from the live cache count, updates albums_cache', async () => {
  const q = fakeQuery((sql) => (sql.includes('FROM products') ? { rows: [{ product_count: 10, cache_count: 7 }] } : { rows: [], rowCount: 1 }))
  const res = await handleInventoryCountUpdated(
    {
      type: 'inventory.count.updated',
      created_at: '2026-11-13T10:00:00Z',
      data: { object: { inventory_counts: [
        { catalog_object_id: 'VAR1', state: 'IN_STOCK', quantity: '5' },
        { catalog_object_id: 'VAR1', state: 'WASTE', quantity: '1' },
      ] } },
    },
    { query: q.query },
  )
  assert.deepEqual(res.results, ['VAR1: -2'])
  const insert = q.calls.find((c) => c.sql.startsWith('INSERT INTO inventory'))
  assert.equal(insert.params[1], -2)
  const update = q.calls.find((c) => c.sql.startsWith('UPDATE albums_cache'))
  assert.deepEqual(update.params, [5, '2026-11-13T10:00:00Z', 'VAR1'])
})

test('inventory: unknown variation is skipped', async () => {
  const q = fakeQuery()
  const res = await handleInventoryCountUpdated(
    { data: { object: { inventory_counts: [{ catalog_object_id: 'X', state: 'IN_STOCK', quantity: 1 }] } } },
    { query: q.query },
  )
  assert.deepEqual(res.results, ['X: not in products'])
  assert.equal(q.calls.length, 1)
})

// ---------- Square: order status ----------

const fulfillment = (state) => ({
  type: 'order.fulfillment.updated',
  data: { object: { order_fulfillment_updated: { order_id: 'SQ1', fulfillment_update: [{ new_state: state }] } } },
})

test('order: RESERVED is stored without calling the email path', async () => {
  const q = fakeQuery(() => ({ rows: [], rowCount: 1 }))
  let called = false
  const res = await handleOrderFulfillmentUpdated(fulfillment('RESERVED'), {
    query: q.query,
    updateOrderStatus: async () => { called = true },
  })
  assert.equal(called, false)
  assert.equal(res.email, false)
  assert.deepEqual(q.calls[0].params, ['RESERVED', 'SQ1'])
})

test('order: PREPARED goes through updateOrderStatus once, without forceEmail', async () => {
  const seen = []
  const res = await handleOrderFulfillmentUpdated(fulfillment('PREPARED'), {
    query: async () => { throw new Error('should not query') },
    updateOrderStatus: async (body) => {
      seen.push(body)
      return new Response(JSON.stringify({ success: true, order: { status: 'PREPARED' }, email: { sent: true } }), { status: 200 })
    },
  })
  assert.deepEqual(seen, [{ square_order_id: 'SQ1', status: 'PREPARED', fulfillment_state: 'PREPARED' }])
  assert.equal(res.ok, true)
  assert.equal(res.email.sent, true)
})

test('order: unknown order is skipped, server error is reported (so Square retries)', async () => {
  const notFound = await handleOrderFulfillmentUpdated(fulfillment('COMPLETED'), {
    query: async () => ({ rows: [] }),
    updateOrderStatus: async () => new Response('{}', { status: 404 }),
  })
  assert.equal(notFound.skipped, 'order not in db')
  const failed = await handleOrderFulfillmentUpdated(fulfillment('COMPLETED'), {
    query: async () => ({ rows: [] }),
    updateOrderStatus: async () => new Response(JSON.stringify({ error: 'db down' }), { status: 500 }),
  })
  assert.equal(failed.ok, false)
})

// ---------- Square webhook route (signature) ----------

test('webhook: not configured → 503, bad signature → 401, valid signature on an ignored type → 200', async () => {
  const { webHandler } = await import('../api/square/webhook.js')
  const url = 'https://spiralgrooverecords.com/api/square/webhook'
  const body = JSON.stringify({ type: 'catalog.version.updated', event_id: 'e1' })
  const post = (sig) => webHandler(new Request(url, { method: 'POST', body, headers: sig ? { 'x-square-hmacsha256-signature': sig } : {} }))

  delete process.env.SQUARE_WEBHOOK_SIGNATURE_KEY
  assert.equal((await post('x')).status, 503)

  process.env.SQUARE_WEBHOOK_SIGNATURE_KEY = 'test-key'
  assert.equal((await post('nope')).status, 401)
  const sig = createHmac('sha256', 'test-key').update(url + body).digest('base64')
  const ok = await post(sig)
  assert.equal(ok.status, 200)
  assert.equal((await ok.json()).ignored, 'catalog.version.updated')
  delete process.env.SQUARE_WEBHOOK_SIGNATURE_KEY
})

// ---------- orders/update email delivery gate ----------

test('orders/update: email delivery accepts SMTP without Make webhook', async () => {
  const { emailDeliveryConfigured } = await import('../api/orders/update.js')
  const env = { ...process.env }
  try {
    process.env.SGR_SMTP_URL = 'smtps://user:pass@smtp.example.com:465'
    delete process.env.MAKE_EMAIL_WEBHOOK_URL
    assert.equal(emailDeliveryConfigured(), true)

    delete process.env.SGR_SMTP_URL
    process.env.MAKE_EMAIL_WEBHOOK_URL = 'https://hook.us2.make.com/example'
    assert.equal(emailDeliveryConfigured(), true)

    delete process.env.SGR_SMTP_URL
    delete process.env.MAKE_EMAIL_WEBHOOK_URL
    assert.equal(emailDeliveryConfigured(), false)
  } finally {
    process.env = env
  }
})

// ---------- orders/update lock ----------

test('orders/update: open during cutover, locked once Square points at the site', async () => {
  const { webHandler } = await import('../api/orders/update.js')
  const env = { ...process.env }
  try {
    process.env.NODE_ENV = 'production'
    delete process.env.WEBHOOK_SECRET
    process.env.SQUARE_WEBHOOK_SIGNATURE_KEY = 'k'
    const req = () => new Request('https://x/api/orders/update', { method: 'PATCH', body: '{}' })
    assert.equal((await webHandler(req())).status, 401)

    process.env.WEBHOOK_SECRET = 's3cret'
    assert.equal((await webHandler(req())).status, 401)
    const withSecret = await webHandler(
      new Request('https://x/api/orders/update', { method: 'PATCH', body: '{}', headers: { 'x-webhook-secret': 's3cret' } }),
    )
    assert.equal(withSecret.status, 400) // passed auth; missing order id
  } finally {
    process.env = env
  }
})

// ---------- Staff Picks ----------

test('staff picks: writes quotes before swapping, strips quote marks', async () => {
  const q = fakeQuery((sql) => {
    if (sql.includes('count(*)')) return { rows: [{ n: 0 }] }
    if (sql.includes('FROM albums_cache')) return { rows: [{ name: 'Album A', category: 'New Vinyl', square_item_id: 'I1', square_variation_id: 'V1' }] }
    return { rows: [], rowCount: 1 }
  })
  const res = await refreshStaffPicks({
    query: q.query,
    complete: async () => '“Warm Rhodes and a slow groove.”',
    now: () => new Date('2026-11-16T07:45:00Z'),
    withTransaction: async (fn) => fn(q.query),
  })
  assert.deepEqual(res.picks, ['Album A'])
  const kinds = q.calls.map((c) => {
    if (c.sql.includes('pg_advisory_xact_lock')) return 'LOCK'
    if (c.sql.includes('count(*)')) return 'COUNT'
    if (c.sql.includes('FROM albums_cache')) return 'ALBUMS'
    if (c.sql.startsWith('DELETE')) return 'DELETE'
    if (c.sql.startsWith('INSERT')) return 'INSERT'
    return c.sql.split(' ')[0]
  })
  assert.deepEqual(kinds, ['COUNT', 'ALBUMS', 'LOCK', 'COUNT', 'DELETE', 'INSERT'])
  assert.equal(q.calls.find((c) => c.sql.startsWith('INSERT')).params[3], 'Warm Rhodes and a slow groove.')
})

test('staff picks: a failed LLM call leaves last week alone; already-refreshed day is a no-op', async () => {
  const q = fakeQuery((sql) => {
    if (sql.includes('count(*)')) return { rows: [{ n: 0 }] }
    if (sql.includes('FROM albums_cache')) return { rows: [{ name: 'A', category: 'New Vinyl' }] }
    return { rows: [] }
  })
  await assert.rejects(refreshStaffPicks({ query: q.query, complete: async () => { throw new Error('llm down') } }))
  assert.ok(!q.calls.some((c) => c.sql.startsWith('DELETE')))

  const done = fakeQuery(() => ({ rows: [{ n: 4 }] }))
  const res = await refreshStaffPicks({ query: done.query, complete: async () => 'x' })
  assert.equal(res.note, 'already refreshed today')
  assert.equal(done.calls.length, 1)
})

test('staff picks: lock re-check skips swap if another run finished during LLM', async () => {
  let counts = 0
  const q = fakeQuery((sql) => {
    if (sql.includes('count(*)')) {
      counts += 1
      return { rows: [{ n: counts === 1 ? 0 : 4 }] }
    }
    if (sql.includes('FROM albums_cache')) {
      return { rows: [{ name: 'A', category: 'New Vinyl', square_item_id: 'I', square_variation_id: 'V' }] }
    }
    return { rows: [], rowCount: 1 }
  })
  const res = await refreshStaffPicks({
    query: q.query,
    complete: async () => 'quote',
    withTransaction: async (fn) => fn(q.query),
  })
  assert.equal(res.note, 'already refreshed today')
  assert.ok(!q.calls.some((c) => c.sql.startsWith('DELETE')))
  assert.ok(!q.calls.some((c) => c.sql.startsWith('INSERT')))
})

test('staff picks LLM: OpenAI-compatible request, errors surface', async () => {
  let sent
  const complete = createCompleter({ STAFF_PICKS_LLM_API_KEY: 'k', STAFF_PICKS_LLM_PROVIDER: 'openai' }, async (url, init) => {
    sent = { url, body: JSON.parse(init.body) }
    return new Response(JSON.stringify({ choices: [{ message: { content: ' quote ' } }] }))
  })
  assert.equal(await complete('p'), 'quote')
  assert.equal(sent.url, 'https://api.openai.com/v1/chat/completions')
  assert.equal(sent.body.model, 'gpt-4.1-mini')
  const bad = createCompleter({ STAFF_PICKS_LLM_API_KEY: 'k', STAFF_PICKS_LLM_PROVIDER: 'openai' }, async () => new Response('{}', { status: 500 }))
  await assert.rejects(bad('p'), (err) => err instanceof LlmProviderError && /LLM other/.test(err.message))
})

test('staff picks LLM: Anthropic Messages API when key is sk-ant-', async () => {
  assert.equal(resolveLlmProvider({ STAFF_PICKS_LLM_API_KEY: 'sk-ant-test' }), 'anthropic')
  let sent
  const complete = createCompleter({ STAFF_PICKS_LLM_API_KEY: 'sk-ant-test' }, async (url, init) => {
    sent = { url, headers: init.headers, body: JSON.parse(init.body) }
    return new Response(JSON.stringify({ content: [{ type: 'text', text: ' punchy drums. ' }] }))
  })
  assert.equal(await complete('p'), 'punchy drums.')
  assert.equal(sent.url, 'https://api.anthropic.com/v1/messages')
  assert.equal(sent.headers['x-api-key'], 'sk-ant-test')
  assert.equal(sent.headers['anthropic-version'], '2023-06-01')
  assert.equal(sent.body.model, 'claude-haiku-4-5-20251001')
  assert.equal(sent.body.max_tokens, 256)
})

test('staff picks LLM: classifies rate limit and quota failures', async () => {
  assert.equal(classifyLlmFailure(429, { error: { type: 'rate_limit_error', message: 'slow down' } }).kind, 'rate_limit')
  assert.equal(
    classifyLlmFailure(400, { error: { type: 'insufficient_quota', message: 'You exceeded your current quota' } }).kind,
    'quota',
  )
  assert.equal(classifyLlmFailure(401, { error: { type: 'authentication_error', message: 'invalid x-api-key' } }).kind, 'auth')

  const limited = createCompleter({ STAFF_PICKS_LLM_API_KEY: 'sk-ant-x' }, async () =>
    new Response(JSON.stringify({ error: { type: 'rate_limit_error', message: 'rate limited' } }), { status: 429 }),
  )
  await assert.rejects(limited('p'), (err) => err instanceof LlmProviderError && err.kind === 'rate_limit')

  const broke = createCompleter({ STAFF_PICKS_LLM_API_KEY: 'sk-ant-x' }, async () =>
    new Response(JSON.stringify({ error: { type: 'invalid_request_error', message: 'bad' } }), { status: 400 }),
  )
  await assert.rejects(broke('p'), (err) => err instanceof LlmProviderError && err.kind === 'other')
})

// ---------- email ----------

test('sendEmail: direct mode sends, suppresses the test inbox, sale alerts use the projects account', async () => {
  const sent = await sendEmail({ type: 'order_status_update', to: 'customer@example.com', data: {}, force: true })
  assert.equal(sent.ok, true)
  assert.equal(sent.attempted, true)
  const suppressed = await sendEmail({ type: 'signup', to: 'test-inbox@example.com', data: {}, force: true })
  assert.equal(suppressed.reason, 'suppressed_recipient')
  const sale = await sendEmail({ type: 'sale_alert', to: 'test-inbox@example.com', data: {}, force: true })
  assert.equal(sale.attempted, true) // the suppression only applied to Make's transactional route
})

test('mailer: From defaults match the Make connections', () => {
  assert.deepEqual(buildFrom('sgr'), { name: 'Spiral Groove Records', address: 'noreply@spiralgrooverecords.com' })
  assert.equal(buildFrom('projects'), 'general@greychair.digital')
  assert.deepEqual(buildFrom('projects', { fromName: 'X' }), { name: 'X', address: 'general@greychair.digital' })
})

test('alerts: email alerts@ via SMTP (no Slack/Make)', async () => {
  const { sendSlackAlert } = await import('../api/slackAlerts.js')
  const res = await sendSlackAlert({
    statusCode: 500,
    error: 'test observability alert',
    endpoint: '/api/health',
    method: 'GET',
    dedupeKey: `test-obs-${Date.now()}`,
  })
  assert.equal(res.channel, 'email')
  assert.equal(res.sent, true)
  assert.equal(res.to, 'alerts@greychair.io')
})
