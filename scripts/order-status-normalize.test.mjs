#!/usr/bin/env node
/**
 * Quick checks for api/orderStatusNormalize.js
 * Run: node scripts/order-status-normalize.test.mjs
 */

import { normalizeOrderStatus, deriveStatusFromSquareOrder, statusesMatch } from '../api/orderStatusNormalize.js'

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    console.error(`FAIL: ${label} — expected ${expected}, got ${actual}`)
    process.exitCode = 1
  } else {
    console.log(`ok: ${label}`)
  }
}

const pickupOrder = { pickup_details: { deliveryMethod: 'pickup' } }

let r = normalizeOrderStatus({ status: 'READY' }, pickupOrder)
assertEqual(r.status, 'PREPARED', 'READY → PREPARED')

r = normalizeOrderStatus({ status: 'COMPLETED', delivery_method: 'pickup' }, pickupOrder)
assertEqual(r.status, 'PREPARED', 'pickup COMPLETED without fulfillment → PREPARED')

r = normalizeOrderStatus(
  { status: 'COMPLETED', fulfillment_state: 'COMPLETED', delivery_method: 'pickup' },
  pickupOrder,
)
assertEqual(r.status, 'COMPLETED', 'pickup COMPLETED with fulfillment COMPLETED')

r = normalizeOrderStatus({ status: 'COMPLETED', event_type: 'marked_as_ready' }, pickupOrder)
assertEqual(r.status, 'PREPARED', 'event marked_as_ready')

r = normalizeOrderStatus({ status: 'SHIPPED', delivery_method: 'delivery' }, { pickup_details: { deliveryMethod: 'delivery' } })
assertEqual(r.status, 'SHIPPED', 'delivery SHIPPED passthrough')

let d = deriveStatusFromSquareOrder(
  {
    state: 'COMPLETED',
    fulfillments: [{ type: 'PICKUP', state: 'PREPARED' }],
  },
  { pickup_details: { deliveryMethod: 'pickup' } },
)
assertEqual(d.status, 'PREPARED', 'Square paid + fulfillment PREPARED → PREPARED')

d = deriveStatusFromSquareOrder(
  {
    state: 'COMPLETED',
    fulfillments: [{ type: 'PICKUP', state: 'COMPLETED' }],
  },
  { pickup_details: { deliveryMethod: 'pickup' } },
)
assertEqual(d.status, 'COMPLETED', 'Square pickup fulfilled → COMPLETED')

assertEqual(statusesMatch('completed', 'COMPLETED'), true, 'statusesMatch case insensitive')

if (!process.exitCode) {
  console.log('\nAll normalization checks passed.')
}
