#!/usr/bin/env node
/**
 * Update order status and optionally resend customer email.
 *
 * Usage:
 *   node scripts/resend-order-status-email.mjs ORD-XXXXX-XXXX PREPARED
 *   node scripts/resend-order-status-email.mjs ORD-XXXXX-XXXX PREPARED --force
 *
 * Requires .env.local with SGR_DATABASE_URL and MAKE_EMAIL_WEBHOOK_URL,
 * OR set ORDERS_UPDATE_URL to hit a deployed /api/orders/update endpoint.
 */

import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')
const envPath = resolve(projectRoot, '.env.local')

if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf-8').split(/\r?\n/)) {
    if (!line.trim() || line.startsWith('#')) continue
    const i = line.indexOf('=')
    if (i < 1) continue
    const key = line.slice(0, i).trim()
    const value = line.slice(i + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = value
  }
}

const orderNumber = process.argv[2]
const status = (process.argv[3] || 'PREPARED').toUpperCase()
const forceEmail = process.argv.includes('--force') || process.argv.includes('-f')

if (!orderNumber) {
  console.error('Usage: node scripts/resend-order-status-email.mjs <order_number> [status] [--force]')
  process.exit(1)
}

const baseUrl = process.env.ORDERS_UPDATE_URL || process.env.SITE_URL || 'http://localhost:3001'
const url = `${baseUrl.replace(/\/$/, '')}/api/orders/update`

const headers = { 'Content-Type': 'application/json' }
if (process.env.WEBHOOK_SECRET) {
  headers['x-webhook-secret'] = process.env.WEBHOOK_SECRET
}

const res = await fetch(url, {
  method: 'PATCH',
  headers,
  body: JSON.stringify({
    order_number: orderNumber,
    order_id: orderNumber,
    status,
    forceEmail,
  }),
})

const text = await res.text()
let json
try {
  json = JSON.parse(text)
} catch {
  json = { raw: text }
}

console.log(JSON.stringify(json, null, 2))

if (!res.ok || !json.success) {
  process.exit(1)
}

if (json.email?.sent) {
  console.log(`\nEmail sent to ${json.email.to}`)
} else {
  console.log(`\nEmail not sent: ${json.email?.skipReason || 'unknown'}`)
}
