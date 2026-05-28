/**
 * POST /api/orders/reconcile
 *
 * Compares Neon orders.status to Square fulfillment state and optionally fixes mismatches.
 *
 * Query: ?dryRun=1 (default) | ?apply=1
 * Header: x-webhook-secret (required when WEBHOOK_SECRET is set)
 */

import { createRequire } from 'module'
import { query } from '../db.js'
import { withWebHandler } from '../_vercelNodeAdapter.js'
import {
  deriveStatusFromSquareOrder,
  inferStatusFromDbHeuristics,
  statusesMatch,
} from '../orderStatusNormalize.js'

const require = createRequire(import.meta.url)
const { SquareClient, SquareEnvironment } = require('square')

export const config = {
  runtime: 'nodejs',
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getSquareClient() {
  const accessToken = process.env.SQUARE_ACCESS_TOKEN
  if (!accessToken) {
    throw new Error('Missing SQUARE_ACCESS_TOKEN')
  }
  const env = (process.env.SQUARE_ENVIRONMENT || 'production').toLowerCase()
  return new SquareClient({
    accessToken,
    environment: env === 'sandbox' ? SquareEnvironment.Sandbox : SquareEnvironment.Production,
  })
}

async function retrieveSquareOrder(client, squareOrderId) {
  const response = await client.orders.get({ orderId: squareOrderId })
  if (response?.order) return response.order
  const body = response?.result || response?.data || response?.body
  return body?.order || null
}

export async function webHandler(request) {
  const method = (request.method || 'GET').toUpperCase()
  if (method !== 'POST' && method !== 'GET') {
    return new Response(JSON.stringify({ success: false, error: 'Use GET or POST.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const webhookSecret = request.headers.get('x-webhook-secret')
  if (process.env.WEBHOOK_SECRET && webhookSecret !== process.env.WEBHOOK_SECRET) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const url = new URL(request.url)
  const apply = url.searchParams.get('apply') === '1' || url.searchParams.get('apply') === 'true'
  const dryRun = !apply
  const heuristicOnly =
    url.searchParams.get('heuristic') === '1' || url.searchParams.get('heuristic') === 'true'
  const limit = Math.min(Number(url.searchParams.get('limit') || 500), 2000)
  const delayMs = Math.max(Number(url.searchParams.get('delayMs') || 120), 0)

  try {
    let client = null
    if (!heuristicOnly) {
      try {
        client = getSquareClient()
      } catch (clientErr) {
        console.warn('[Orders Reconcile] Square client unavailable, using heuristics only:', clientErr?.message)
      }
    }

    const rows = await query(
      `SELECT id, order_number, square_order_id, status, delivery_method, pickup_details, created_at, updated_at
       FROM orders
       WHERE square_order_id IS NOT NULL AND TRIM(square_order_id) <> ''
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit],
    )

    const results = []
    let checked = 0
    let mismatches = 0
    let fixed = 0
    let errors = 0

    for (const row of rows.rows) {
      checked += 1
      const entry = {
        order_number: row.order_number,
        square_order_id: row.square_order_id,
        db_status: row.status,
        expected_status: null,
        fulfillment_state: null,
        delivery_method: null,
        source: null,
        match: true,
        updated: false,
        error: null,
      }

      try {
        let derived = null

        if (client && !heuristicOnly) {
          try {
            const squareOrder = await retrieveSquareOrder(client, row.square_order_id)
            if (!squareOrder) {
              entry.error = 'square_order_not_found'
            } else {
              derived = deriveStatusFromSquareOrder(squareOrder, row)
            }
          } catch (squareErr) {
            entry.square_error = squareErr?.message || String(squareErr)
            derived = null
          }
        }

        if (!derived) {
          const inferred = inferStatusFromDbHeuristics(row)
          if (inferred) {
            derived = {
              status: inferred.status,
              fulfillmentState: null,
              deliveryMethod: 'pickup',
              source: inferred.reason,
            }
          }
        }

        if (!derived) {
          if (!entry.error && !entry.square_error) {
            entry.match = true
          } else {
            entry.match = false
            errors += 1
          }
          results.push(entry)
          continue
        }

        entry.expected_status = derived.status
        entry.fulfillment_state = derived.fulfillmentState
        entry.delivery_method = derived.deliveryMethod
        entry.source = derived.source
        entry.match = statusesMatch(row.status, derived.status)

        if (!entry.match) {
          mismatches += 1
          if (apply) {
            await query(
              `UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
              [derived.status, row.id],
            )
            entry.updated = true
            fixed += 1
          }
        }
      } catch (err) {
        entry.error = err?.message || String(err)
        entry.match = false
        errors += 1
      }

      results.push(entry)
      if (delayMs > 0) await sleep(delayMs)
    }

    const mismatchRows = results.filter((r) => !r.match && !r.error)

    return new Response(
      JSON.stringify({
        success: true,
        dryRun,
        apply,
        summary: {
          checked,
          mismatches,
          fixed: apply ? fixed : 0,
          errors,
          alreadyCorrect: checked - mismatches - errors,
        },
        mismatches: mismatchRows,
        results: dryRun ? results : undefined,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('[Orders Reconcile]', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || 'Reconcile failed',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
}

export default withWebHandler(webHandler)
