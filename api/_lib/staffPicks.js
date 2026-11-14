/**
 * Weekly Staff Picks (replaces the Make.com "Staff Picks" scenario).
 * Picks the 4 best-selling in-stock New Vinyl albums not already picked, writes a short quote
 * for each with an LLM, then swaps them into `staff_picks` (read by api/staff-picks.js).
 *
 * Caller: api/staff-picks-weekly.js (Vercel Cron + manual POST).
 * No other Staff Picks writer in-repo.
 *
 * Concurrency: after quotes are ready, one Postgres transaction takes
 * `pg_advisory_xact_lock(hashtext('spiral_groove.staff_picks'))`, re-checks "already today",
 * then DELETE+INSERT in the same txn so readers never see an empty table mid-swap and
 * parallel cron/manual runs cannot double-insert.
 *
 * User: "lets do it" (fix the Staff Picks race).
 *
 * LLM:
 *   STAFF_PICKS_LLM_API_KEY (or OPENAI_API_KEY / ANTHROPIC_API_KEY)
 *   STAFF_PICKS_LLM_PROVIDER  openai | anthropic (default: anthropic if key starts with sk-ant-)
 *   STAFF_PICKS_LLM_BASE_URL  (openai default https://api.openai.com/v1,
 *                             anthropic default https://api.anthropic.com)
 *   STAFF_PICKS_LLM_MODEL     (openai default gpt-4.1-mini; anthropic default claude-haiku-4-5)
 */

/** Stable advisory lock key (hashtext of this string inside Postgres). */
export const STAFF_PICKS_LOCK_ID = 'spiral_groove.staff_picks'

export function resolveLlmProvider(env = process.env) {
  const explicit = String(env.STAFF_PICKS_LLM_PROVIDER || '').trim().toLowerCase()
  if (explicit === 'anthropic' || explicit === 'openai') return explicit
  const key = env.STAFF_PICKS_LLM_API_KEY || env.ANTHROPIC_API_KEY || env.OPENAI_API_KEY || ''
  if (String(key).startsWith('sk-ant-')) return 'anthropic'
  return 'openai'
}

export function staffPickPrompt(name, category) {
  return `You are Spiral Groove Records staff. Write ONE short “Staff Pick” quote for an album card.

Inputs:
- ${name}
- Genre tags: ${category}

Rules:
- 1–2 sentences total, 18–32 words.
- Sound like a friendly indie record-store human: punchy, specific, no hypey corporate tone.
- Mention at least ONE concrete musical detail (instrument/sound/mood/era/scene), not generic “great record.”
- Avoid: “masterpiece,” “must-have,” “iconic,” “legendary,” “you’ll love it,” “perfect for,” excessive emojis.
- No profanity.
- Do NOT mention prices, sales, shipping, or inventory counts.
- Do NOT include quote marks.

Output ONLY the quote.`
}

export function llmConfigured(env = process.env) {
  return Boolean(env.STAFF_PICKS_LLM_API_KEY || env.ANTHROPIC_API_KEY || env.OPENAI_API_KEY)
}

/** @typedef {'rate_limit'|'quota'|'auth'|'other'} LlmFailureKind */

export class LlmProviderError extends Error {
  /**
   * @param {string} message
   * @param {{ kind: LlmFailureKind, status?: number, provider?: string, rawType?: string }} meta
   */
  constructor(message, meta) {
    super(message)
    this.name = 'LlmProviderError'
    this.kind = meta.kind
    this.status = meta.status
    this.provider = meta.provider
    this.rawType = meta.rawType
  }
}

/**
 * Classify Anthropic / OpenAI HTTP failures for alerting.
 * @returns {{ kind: LlmFailureKind, message: string, rawType?: string }}
 */
export function classifyLlmFailure(status, body = {}) {
  const err = body?.error || {}
  const rawType = String(err.type || err.code || err.error || '').toLowerCase()
  const msg = String(err.message || body?.message || '').toLowerCase()
  const blob = `${rawType} ${msg}`

  if (
    status === 429 ||
    rawType.includes('rate_limit') ||
    blob.includes('rate limit') ||
    blob.includes('too many requests') ||
    rawType.includes('overloaded')
  ) {
    return { kind: 'rate_limit', message: err.message || `HTTP ${status}`, rawType: rawType || undefined }
  }
  if (
    status === 402 ||
    rawType.includes('insufficient_quota') ||
    rawType.includes('billing') ||
    blob.includes('credit') ||
    blob.includes('quota') ||
    blob.includes('billing') ||
    blob.includes('payment') ||
    blob.includes('spend limit')
  ) {
    return { kind: 'quota', message: err.message || `HTTP ${status}`, rawType: rawType || undefined }
  }
  if (status === 401 || status === 403 || rawType.includes('auth') || blob.includes('invalid api key')) {
    return { kind: 'auth', message: err.message || `HTTP ${status}`, rawType: rawType || undefined }
  }
  return { kind: 'other', message: err.message || err.type || `HTTP ${status}`, rawType: rawType || undefined }
}

function throwLlmFailure(provider, status, body) {
  const { kind, message, rawType } = classifyLlmFailure(status, body)
  throw new LlmProviderError(`LLM ${kind}: ${message}`, { kind, status, provider, rawType })
}

export function createCompleter(env = process.env, fetchImpl = fetch) {
  const provider = resolveLlmProvider(env)
  const key = env.STAFF_PICKS_LLM_API_KEY || (provider === 'anthropic' ? env.ANTHROPIC_API_KEY : env.OPENAI_API_KEY)
  const base = String(
    env.STAFF_PICKS_LLM_BASE_URL ||
      (provider === 'anthropic' ? 'https://api.anthropic.com' : 'https://api.openai.com/v1'),
  ).replace(/\/$/, '')
  const model =
    env.STAFF_PICKS_LLM_MODEL || (provider === 'anthropic' ? 'claude-haiku-4-5' : 'gpt-4.1-mini')

  return async function complete(prompt) {
    if (!key) throw new Error('STAFF_PICKS_LLM_API_KEY (or ANTHROPIC_API_KEY / OPENAI_API_KEY) is not set')

    if (provider === 'anthropic') {
      const res = await fetchImpl(`${base}/v1/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          max_tokens: 256,
          temperature: 1,
          messages: [{ role: 'user', content: prompt }],
        }),
        signal: AbortSignal.timeout(30_000),
      })
      const body = await res.json().catch(() => ({}))
      const text = Array.isArray(body?.content)
        ? body.content
            .filter((b) => b?.type === 'text' && b?.text)
            .map((b) => b.text)
            .join('\n')
            .trim()
        : ''
      if (!res.ok || !text) throwLlmFailure(provider, res.status, body)
      return text
    }

    const res = await fetchImpl(`${base}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], temperature: 1 }),
      signal: AbortSignal.timeout(30_000),
    })
    const body = await res.json().catch(() => ({}))
    const text = body?.choices?.[0]?.message?.content?.trim()
    if (!res.ok || !text) throwLlmFailure(provider, res.status, body)
    return text
  }
}

/**
 * @param {{
 *   query: (sql: string, params?: any[]) => Promise<{ rows: any[], rowCount?: number }>,
 *   complete: (prompt: string) => Promise<string>,
 *   now?: () => Date,
 *   withTransaction?: (fn: (txQuery: typeof query) => Promise<any>) => Promise<any>,
 * }} opts
 */
export async function refreshStaffPicks({ query, complete, now = () => new Date(), withTransaction }) {
  const today = now().toISOString().slice(0, 10)

  // Cheap early exit (no lock) — skip LLM when today already has picks.
  const { rows: existing } = await query('SELECT count(*)::int AS n FROM staff_picks WHERE created_at >= $1', [today])
  if (existing[0]?.n > 0) return { ok: true, picks: [], note: 'already refreshed today' }

  const { rows: albums } = await query(
    `SELECT name, category, square_item_id, square_variation_id, sold_count
       FROM albums_cache
      WHERE category = 'New Vinyl' AND stock_count > 1 AND sold_count > 0
        AND square_variation_id NOT IN (SELECT square_variation_id FROM staff_picks WHERE square_variation_id IS NOT NULL)
      ORDER BY sold_count DESC, name ASC
      LIMIT 4`,
  )
  if (albums.length === 0) return { ok: true, picks: [], note: 'no candidates; kept last week' }

  // Finish every LLM quote before touching rows so a failure leaves last week alone.
  const picks = []
  for (const a of albums) {
    const quote = String(await complete(staffPickPrompt(a.name, a.category)))
      .replace(/^["“”']+|["“”']+$/g, '')
      .trim()
    picks.push({ ...a, quote })
  }

  const createdAt = now().toISOString()
  const swap = async (txQuery) => {
    // Serialize concurrent cron + manual runs; released at COMMIT/ROLLBACK.
    await txQuery('SELECT pg_advisory_xact_lock(hashtext($1))', [STAFF_PICKS_LOCK_ID])

    const { rows: again } = await txQuery('SELECT count(*)::int AS n FROM staff_picks WHERE created_at >= $1', [today])
    if (again[0]?.n > 0) return { ok: true, picks: [], note: 'already refreshed today' }

    // Same transaction: outsiders keep seeing old rows until COMMIT (no empty gap).
    await txQuery('DELETE FROM staff_picks')
    for (const p of picks) {
      await txQuery(
        `INSERT INTO staff_picks (square_item_id, square_variation_id, name, quote, created_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [p.square_item_id, p.square_variation_id, p.name, p.quote, createdAt],
      )
    }
    return { ok: true, picks: picks.map((p) => p.name) }
  }

  if (withTransaction) return withTransaction(swap)
  // Tests / callers without a real txn helper still run the swap steps in order.
  return swap(query)
}
