/**
 * Durable email-claim behavior. No database required.
 * Run: node scripts/email-dedupe.test.mjs
 */

import { claimEmailSend, releaseEmailSend } from '../api/emailDedupe.js'

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    console.error(`FAIL: ${label} — expected ${expected}, got ${actual}`)
    process.exitCode = 1
  } else {
    console.log(`ok: ${label}`)
  }
}

const calls = []
function mockQuery(handler) {
  return async (text, params) => {
    calls.push({ text: String(text), params })
    return handler(text, params)
  }
}

// First claim inserts.
calls.length = 0
let result = await claimEmailSend({
  dedupeKey: 'order_status_update:ORD-1:PROPOSED',
  emailType: 'order_status_update',
  queryFn: mockQuery(() => ({ rowCount: 1 })),
})
assertEqual(result.claimed, true, 'first claim wins')
assertEqual(calls.some((c) => c.text.includes('ON CONFLICT (dedupe_key) DO NOTHING')), true, 'claim uses DO NOTHING')

// Parallel webhook loses the insert.
result = await claimEmailSend({
  dedupeKey: 'order_status_update:ORD-1:PROPOSED',
  emailType: 'order_status_update',
  queryFn: mockQuery(() => ({ rowCount: 0 })),
})
assertEqual(result.claimed, false, 'conflict is a duplicate')
assertEqual(result.reason, 'deduped', 'duplicate reason')

// Intentional resend overwrites.
calls.length = 0
result = await claimEmailSend({
  dedupeKey: 'order_status_update:ORD-1:PROPOSED',
  emailType: 'order_status_update',
  replace: true,
  queryFn: mockQuery(() => ({ rowCount: 1 })),
})
assertEqual(result.claimed, true, 'resend replaces the claim')
assertEqual(calls.some((c) => c.text.includes('DO UPDATE')), true, 'resend uses DO UPDATE')

// Database outage fails open.
result = await claimEmailSend({
  dedupeKey: 'order_status_update:ORD-1:PREPARED',
  emailType: 'order_status_update',
  queryFn: async () => {
    throw new Error('connection refused')
  },
})
assertEqual(result.claimed, true, 'db failure still allows the send')
assertEqual(result.reason, 'dedupe_unavailable', 'db failure reason')

// Failed send releases the key.
calls.length = 0
await releaseEmailSend(
  'order_status_update:ORD-1:PROPOSED',
  mockQuery(() => ({ rowCount: 1 })),
)
assertEqual(calls.some((c) => c.text.startsWith('DELETE FROM email_sends')), true, 'release deletes the claim')

if (!process.exitCode) {
  console.log('\nAll email dedupe checks passed.')
}
