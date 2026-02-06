#!/usr/bin/env node
/**
 * Profile DB query timings by running a few representative handlers and capturing
 * the per-query durations from api/db.js::withQueryTimings().
 *
 * Output: scripts/DB_QUERY_TIMINGS.md
 */

import dotenv from 'dotenv'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import fs from 'fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const repoRoot = join(__dirname, '..')

dotenv.config({ path: join(repoRoot, '.env.local') })
dotenv.config({ path: join(repoRoot, '.env') })

import { withQueryTimings, closePool } from '../api/db.js'

function nowIso() {
  return new Date().toISOString()
}

function trunc(s, n) {
  const str = String(s ?? '')
  if (str.length <= n) return str
  return str.slice(0, n - 1) + '…'
}

function normalizeSql(sql) {
  return String(sql || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180)
}

function summarizeTimings(timings) {
  /** @type {Map<string, { key: string, count: number, totalMs: number, maxMs: number, okCount: number, errCount: number }>} */
  const m = new Map()
  for (const t of timings) {
    const key = normalizeSql(t.sql)
    const cur = m.get(key) || { key, count: 0, totalMs: 0, maxMs: 0, okCount: 0, errCount: 0 }
    cur.count += 1
    cur.totalMs += Number(t.durationMs || 0)
    cur.maxMs = Math.max(cur.maxMs, Number(t.durationMs || 0))
    if (t.ok) cur.okCount += 1
    else cur.errCount += 1
    m.set(key, cur)
  }
  const rows = Array.from(m.values())
  rows.sort((a, b) => b.totalMs - a.totalMs)
  return rows
}

async function runCase(name, fn) {
  const startedAt = Date.now()
  const { result, timings } = await withQueryTimings(fn)
  const durationMs = Date.now() - startedAt
  return { name, durationMs, timings, result }
}

async function callWebHandler(modPath, urlPath, { method = 'GET', headers = {}, body } = {}) {
  const mod = await import(modPath)
  if (typeof mod.webHandler !== 'function') throw new Error(`No webHandler export in ${modPath}`)
  const req = new Request(`https://local.test${urlPath}`, {
    method,
    headers: new Headers(headers),
    body: body ? JSON.stringify(body) : undefined,
  })
  const res = await mod.webHandler(req)
  const text = await res.text()
  return { status: res.status, body: trunc(text, 2000) }
}

async function main() {
  const cases = []

  // Products (hits albums_cache)
  cases.push(
    await runCase('GET /api/products', async () => {
      return await callWebHandler('../api/products.js', '/api/products', { method: 'GET' })
    })
  )

  // Products (paged) - representative of frontend usage after keyset pagination
  cases.push(
    await runCase('GET /api/products?limit=500', async () => {
      return await callWebHandler('../api/products.js', '/api/products?limit=500', { method: 'GET' })
    })
  )

  // Events
  cases.push(
    await runCase('GET /api/events', async () => {
      return await callWebHandler('../api/events.js', '/api/events', { method: 'GET' })
    })
  )

  // Nightly catalog sync (cron-auth header so it runs in prod-like mode)
  cases.push(
    await runCase('GET /api/catalog-sync-nightly (cron)', async () => {
      return await callWebHandler('../api/catalog-sync-nightly.js', '/api/catalog-sync-nightly', {
        method: 'GET',
        headers: { 'x-vercel-cron': '1', 'user-agent': 'vercel-cron' },
      })
    })
  )

  const lines = []
  lines.push(`### DB Query Timings Report`)
  lines.push(``)
  lines.push(`- **Generated**: ${nowIso()}`)
  lines.push(`- **Env**: \`${process.env.NODE_ENV || 'development'}\``)
  lines.push(`- **DB URL configured**: ${Boolean(process.env.SGR_DATABASE_URL || process.env.SPR_DATABASE_URL || process.env.DATABASE_URL)}`)
  lines.push(``)

  for (const c of cases) {
    lines.push(`## ${c.name}`)
    lines.push(``)
    lines.push(`- **Handler duration**: ${c.durationMs}ms`)
    lines.push(`- **DB queries captured**: ${c.timings.length}`)
    lines.push(`- **Handler result**: \`${c.result?.status}\``)
    lines.push(``)

    const summary = summarizeTimings(c.timings)
    lines.push(`### Top queries (by total time)`)
    lines.push(``)
    lines.push(`| total ms | count | max ms | ok/err | sql (normalized) |`)
    lines.push(`|---:|---:|---:|---:|---|`)
    for (const r of summary.slice(0, 25)) {
      lines.push(`| ${r.totalMs.toFixed(0)} | ${r.count} | ${r.maxMs.toFixed(0)} | ${r.okCount}/${r.errCount} | \`${r.key.replace(/`/g, '\\`')}\` |`)
    }
    lines.push(``)

    // Raw sample of first few timings (useful for verifying order)
    lines.push(`### First 15 query timings (raw)`)
    lines.push(``)
    lines.push('```')
    for (const t of c.timings.slice(0, 15)) {
      lines.push(`${String(t.durationMs).padStart(5)}ms  ok=${t.ok ? 'true ' : 'false'}  ${normalizeSql(t.sql)}`)
    }
    lines.push('```')
    lines.push(``)
  }

  const outPath = join(repoRoot, 'scripts', 'DB_QUERY_TIMINGS.md')
  await fs.writeFile(outPath, lines.join('\n') + '\n', 'utf-8')
  console.log(`✅ Wrote ${outPath}`)

  // Best-effort cleanup
  await closePool().catch(() => {})
}

main().catch((e) => {
  console.error('❌ Profiling failed:', e?.message || e)
  console.error(e?.stack || '')
  process.exit(1)
})

