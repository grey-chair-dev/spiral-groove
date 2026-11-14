/**
 * Weekly Staff Picks (replaces the Make.com "Staff Picks" scenario).
 * Picks the 4 best-selling in-stock New Vinyl albums not already picked, writes a short quote
 * for each with an LLM, then swaps them into `staff_picks` (read by api/staff-picks.js).
 *
 * LLM: any OpenAI-compatible chat endpoint.
 *   STAFF_PICKS_LLM_API_KEY (or OPENAI_API_KEY)
 *   STAFF_PICKS_LLM_BASE_URL (default https://api.openai.com/v1)
 *   STAFF_PICKS_LLM_MODEL    (default gpt-4.1-mini, what the Make scenario used)
 */

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
  return Boolean(env.STAFF_PICKS_LLM_API_KEY || env.OPENAI_API_KEY)
}

export function createCompleter(env = process.env, fetchImpl = fetch) {
  const base = String(env.STAFF_PICKS_LLM_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '')
  const model = env.STAFF_PICKS_LLM_MODEL || 'gpt-4.1-mini'
  const key = env.STAFF_PICKS_LLM_API_KEY || env.OPENAI_API_KEY
  return async function complete(prompt) {
    if (!key) throw new Error('STAFF_PICKS_LLM_API_KEY (or OPENAI_API_KEY) is not set')
    const res = await fetchImpl(`${base}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], temperature: 1 }),
      signal: AbortSignal.timeout(30_000),
    })
    const body = await res.json().catch(() => ({}))
    const text = body?.choices?.[0]?.message?.content?.trim()
    if (!res.ok || !text) throw new Error(`LLM call failed: ${body?.error?.message || res.status}`)
    return text
  }
}

export async function refreshStaffPicks({ query, complete, now = () => new Date() }) {
  const today = now().toISOString().slice(0, 10)
  // Already refreshed today (e.g. Make's scenario still on during the cutover, or a manual run): don't stack picks.
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

  // Write every quote first so a failed LLM call leaves last week's picks in place.
  const picks = []
  for (const a of albums) {
    const quote = String(await complete(staffPickPrompt(a.name, a.category)))
      .replace(/^["“”']+|["“”']+$/g, '')
      .trim()
    picks.push({ ...a, quote })
  }

  await query('DELETE FROM staff_picks WHERE created_at < $1', [today])
  for (const p of picks) {
    await query(
      `INSERT INTO staff_picks (square_item_id, square_variation_id, name, quote, created_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [p.square_item_id, p.square_variation_id, p.name, p.quote, now().toISOString()],
    )
  }
  return { ok: true, picks: picks.map((p) => p.name) }
}
