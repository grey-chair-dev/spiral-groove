#!/usr/bin/env node
/**
 * Reconcile Neon order statuses with Square fulfillment state.
 *
 * Usage:
 *   node scripts/reconcile-order-statuses.mjs              # dry run (local API)
 *   node scripts/reconcile-order-statuses.mjs --apply      # write fixes
 *   node scripts/reconcile-order-statuses.mjs --apply --url https://your-deployment.vercel.app
 *
 * Env (.env.local): SGR_DATABASE_URL, SQUARE_ACCESS_TOKEN, WEBHOOK_SECRET (optional for remote)
 * Or set RECONCILE_URL to a deployed /api/orders/reconcile endpoint.
 */

import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')

dotenv.config({ path: resolve(projectRoot, '.env.local') })
dotenv.config({ path: resolve(projectRoot, '.env') })

const apply = process.argv.includes('--apply')
const heuristicOnly = process.argv.includes('--heuristic')
const urlArg = process.argv.find((a) => a.startsWith('--url='))
const baseUrl = (
  urlArg?.split('=')[1] ||
  process.env.RECONCILE_URL?.replace(/\/api\/orders\/reconcile\/?$/, '') ||
  process.env.ORDERS_UPDATE_URL?.replace(/\/api\/orders\/update\/?$/, '') ||
  'http://localhost:3001'
).replace(/\/$/, '')

async function runViaHttp() {
  const qs = apply ? 'apply=1' : 'dryRun=1'
  const endpoint = `${baseUrl}/api/orders/reconcile?${qs}`
  const headers = { Accept: 'application/json' }
  if (process.env.WEBHOOK_SECRET) {
    headers['x-webhook-secret'] = process.env.WEBHOOK_SECRET
  }

  const res = await fetch(endpoint, { method: 'POST', headers })
  const text = await res.text()
  let json
  try {
    json = JSON.parse(text)
  } catch {
    json = { raw: text }
  }
  console.log(JSON.stringify(json, null, 2))
  if (!res.ok || !json.success) process.exit(1)
}

async function runLocal() {
  const { query, closePool } = await import('../api/db.js')
  const {
    deriveStatusFromSquareOrder,
    inferStatusFromDbHeuristics,
    statusesMatch,
  } = await import('../api/orderStatusNormalize.js')
  const { createRequire } = await import('module')
  const require = createRequire(import.meta.url)
  const { SquareClient, SquareEnvironment } = require('square')

  let client = null
  if (!heuristicOnly) {
    const accessToken = process.env.SQUARE_ACCESS_TOKEN
    if (!accessToken) {
      console.error('Missing SQUARE_ACCESS_TOKEN (or pass --heuristic)')
      process.exit(1)
    }
    const env = (process.env.SQUARE_ENVIRONMENT || 'production').toLowerCase()
    client = new SquareClient({
      accessToken,
      environment: env === 'sandbox' ? SquareEnvironment.Sandbox : SquareEnvironment.Production,
    })
  }

  const rows = await query(
    `SELECT id, order_number, square_order_id, status, delivery_method, pickup_details, created_at, updated_at
     FROM orders
     WHERE square_order_id IS NOT NULL AND TRIM(square_order_id) <> ''
     ORDER BY created_at DESC
     LIMIT 500`,
  )

  const mismatches = []
  let fixed = 0

  for (const row of rows.rows) {
    try {
      let derived = null

      if (client) {
        try {
          const response = await client.orders.get({ orderId: row.square_order_id })
          const body = response?.result || response?.data || response
          const squareOrder = response?.order || body?.order
          if (squareOrder) {
            derived = deriveStatusFromSquareOrder(squareOrder, row)
          }
        } catch (squareErr) {
          // fall through to heuristics
          void squareErr
        }
      }

      if (!derived) {
        const inferred = inferStatusFromDbHeuristics(row)
        if (inferred) {
          derived = { status: inferred.status, source: inferred.reason }
        }
      }

      if (!derived) continue

      const match = statusesMatch(row.status, derived.status)
      if (!match) {
        const item = {
          order_number: row.order_number,
          db_status: row.status,
          expected_status: derived.status,
          source: derived.source,
        }
        mismatches.push(item)
        if (apply) {
          await query(
            `UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
            [derived.status, row.id],
          )
          fixed += 1
        }
      }
      if (client) await new Promise((r) => setTimeout(r, 120))
    } catch (err) {
      mismatches.push({
        order_number: row.order_number,
        error: err?.message || String(err),
      })
    }
  }

  console.log(
    JSON.stringify(
      {
        success: true,
        dryRun: !apply,
        checked: rows.rows.length,
        mismatchCount: mismatches.length,
        fixed,
        mismatches,
      },
      null,
      2,
    ),
  )

  await closePool?.()
}

const useHttp = process.argv.includes('--http') || Boolean(process.env.RECONCILE_URL)

if (useHttp) {
  await runViaHttp()
} else if (process.env.SGR_DATABASE_URL || process.env.DATABASE_URL) {
  await runLocal()
} else {
  console.error('Set SGR_DATABASE_URL for local reconcile, or --url / RECONCILE_URL for HTTP.')
  process.exit(1)
}
