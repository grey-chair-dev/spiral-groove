/**
 * Instagram → Neon events (replaces Make "Events From Instagram").
 * Fetches recent public posts via api-anything (logged-out getPosts, ~12),
 * LLM-extracts Spiral Groove attendable events, dedupes on fingerprint.
 */

import './apiAnythingEnv.js'
import { call, saveSite } from 'api-anything'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const VENDORED_SPEC = join(__dirname, 'api-anything-sites', 'instagram.json')

let siteEnsured = false

/** Ensure Instagram ops exist (bundled package + vendored pin). */
export function ensureInstagramSite() {
  if (siteEnsured) return
  try {
    const spec = JSON.parse(readFileSync(VENDORED_SPEC, 'utf8'))
    if (spec?.name === 'instagram' && Array.isArray(spec.operations)) saveSite(spec)
  } catch {
    // Bundled package sites/instagram.json is enough on Vercel.
  }
  siteEnsured = true
}

export function stripLlmJsonFences(text) {
  let s = String(text || '')
  s = s.replace(/```json/gi, '')
  s = s.replace(/```/g, '')
  return s.trim()
}

export function parseEventExtraction(raw) {
  const cleaned = stripLlmJsonFences(raw)
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start < 0 || end < start) throw new Error('LLM did not return JSON object')
  return JSON.parse(cleaned.slice(start, end + 1))
}

export function fingerprintFor(artist, eventDate) {
  return `${String(artist || '')
    .trim()
    .toLowerCase()}${String(eventDate || '').trim()}`
}

export function shouldInsertEvent(extracted) {
  if (!extracted || extracted.is_event !== true) return { ok: false, reason: 'not_event' }
  if (String(extracted.event_type || '').toLowerCase() === 'recap') return { ok: false, reason: 'recap' }
  const confidence = Number(extracted.confidence)
  if (!(confidence > 0.5)) return { ok: false, reason: 'low_confidence' }
  if (!String(extracted.artist || '').trim()) return { ok: false, reason: 'missing_artist' }
  if (!String(extracted.event_date || '').trim()) return { ok: false, reason: 'missing_date' }
  return { ok: true }
}

export function mapApiAnythingPosts(rows) {
  const list = Array.isArray(rows) ? rows : []
  return list
    .map((row) => {
      const code = row?.['node.code'] || row?.node?.code || row?.code
      if (!code) return null
      const caption = row?.['node.caption.text'] ?? row?.node?.caption?.text ?? row?.caption ?? ''
      const a11y = row?.['node.accessibility_caption'] ?? row?.node?.accessibility_caption ?? ''
      const image = row?.['node.display_uri'] ?? row?.node?.display_uri ?? null
      return {
        code: String(code),
        caption: String(caption || ''),
        accessibilityCaption: String(a11y || ''),
        mediaUrl: image != null ? String(image) : null,
        permalink: `https://www.instagram.com/p/${code}/`,
      }
    })
    .filter(Boolean)
}

export function eventExtractionPrompt({ caption, accessibilityCaption, nowIso, timezone }) {
  return `You are an event extraction engine for Spiral Groove Records (a record shop; captions often say "the shop" or "our store" — that means Spiral Groove Records).

Given an Instagram post, determine whether it represents a real-world event
that people can attend at the shop.

An event must invite people to show up at a specific date or time
(explicit or clearly implied, e.g. "this Saturday", "tonight", "Saturday 3–5").

Examples that ARE events: "Join us … this Saturday … live from 3–5", named artist playing at the shop, open mic with a date/time.
Examples that are NOT events: restock/new arrivals only, customer appreciation collages with no show time, pure past-weekend recaps with no future invite.

If it is NOT an event, return is_event=false and null for all other fields.

If it IS an event, extract and normalize the details.

Rules:
- Do NOT invent dates or times.
- Relative dates like "this Saturday" or "tonight" must be resolved using "today" below (no post timestamp available).
- If the post is only a recap of a past event with no upcoming invite, set event_type="recap" (and is_event can still be true only if you also extract the past show; prefer is_event=false for pure recaps).
- If the event location is clearly elsewhere (not the shop / Spiral Groove), set is_event=false.
- Prefer is_event=true when a named artist is invited to play at the shop on a dated day.
- Output valid JSON only. No commentary.

Return format (always exactly this shape):

{
  "is_event": boolean,
  "event_type": "upcoming" | "same_day" | "recap" | null,
  "event_name": string | null,
  "artist": string | null,
  "venue": "Spiral Groove Records" | null,
  "event_date": "YYYY-MM-DD" | null,
  "start_time": "HH:MM" | null,
  "end_time": "HH:MM" | null,
  "event_description": string | null,
  "confidence": number
}

Post data:
- Caption: ${caption || '(empty)'}
- Accessibility caption (may include a posted-on date hint): ${accessibilityCaption || '(empty)'}
- Today (ISO): ${nowIso}
- Timezone: ${timezone || 'America/New_York'}
`
}

export class InstagramFetchError extends Error {
  /**
   * @param {string} message
   * @param {{ class?: string }} [meta]
   */
  constructor(message, meta = {}) {
    super(message)
    this.name = 'InstagramFetchError'
    this.class = meta.class || 'other'
  }
}

/**
 * @param {{ username?: string, callImpl?: typeof call }} [opts]
 */
export async function fetchRecentPosts(opts = {}) {
  ensureInstagramSite()
  const username = String(opts.username || process.env.INSTAGRAM_USERNAME || 'spiral_groove_records_').replace(/^@/, '')
  const callImpl = opts.callImpl || call
  const result = await callImpl('instagram', 'getPosts', { username })
  if (!result?.ok) {
    const cls = String(result?.class || result?.error?.class || 'other')
    throw new InstagramFetchError(result?.reason || result?.error?.message || `instagram getPosts failed (${cls})`, {
      class: cls,
    })
  }
  return mapApiAnythingPosts(result.data)
}

/**
 * @param {{
 *   query: (sql: string, params?: any[]) => Promise<{ rows: any[], rowCount?: number }>,
 *   complete: (prompt: string) => Promise<string>,
 *   fetchPosts?: () => Promise<ReturnType<typeof mapApiAnythingPosts>>,
 *   now?: () => Date,
 *   dryRun?: boolean,
 *   sleepMs?: (ms: number) => Promise<void>,
 * }} opts
 */
export async function syncInstagramEvents(opts) {
  const {
    query,
    complete,
    fetchPosts = () => fetchRecentPosts(),
    now = () => new Date(),
    dryRun = process.env.INSTAGRAM_EVENTS_DRY_RUN === '1',
    sleepMs = (ms) => new Promise((r) => setTimeout(r, ms)),
  } = opts

  const posts = await fetchPosts()
  const timezone = process.env.INSTAGRAM_EVENTS_TZ || 'America/New_York'
  const nowIso = now().toISOString()

  const summary = {
    posts: posts.length,
    considered: 0,
    inserted: 0,
    skipped: [],
    dryRun: Boolean(dryRun),
  }

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i]
    if (i > 0) await sleepMs(400)
    summary.considered += 1

    let extracted
    try {
      const raw = await complete(
        eventExtractionPrompt({
          caption: post.caption,
          accessibilityCaption: post.accessibilityCaption,
          nowIso,
          timezone,
        }),
      )
      extracted = parseEventExtraction(raw)
    } catch (e) {
      summary.skipped.push({ code: post.code, reason: 'llm_parse', detail: e?.message || String(e) })
      continue
    }

    const gate = shouldInsertEvent(extracted)
    if (!gate.ok) {
      summary.skipped.push({ code: post.code, reason: gate.reason })
      continue
    }

    const fingerprint = fingerprintFor(extracted.artist, extracted.event_date)
    const existing = await query(`SELECT id FROM events WHERE fingerprint = $1 LIMIT 1`, [fingerprint])
    if (existing.rows?.length) {
      summary.skipped.push({ code: post.code, reason: 'duplicate', fingerprint })
      continue
    }

    if (dryRun) {
      summary.skipped.push({ code: post.code, reason: 'dry_run', fingerprint })
      continue
    }

    await query(
      `INSERT INTO events (
        is_event, event_type, event_name, artist, venue,
        event_date, start_time, end_time, event_description, confidence,
        event_image_url, event_permalink, fingerprint, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6::date, NULLIF($7, '')::time, NULLIF($8, '')::time, $9, $10,
        $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )`,
      [
        true,
        extracted.event_type || null,
        extracted.event_name || null,
        extracted.artist || null,
        extracted.venue || 'Spiral Groove Records',
        extracted.event_date,
        extracted.start_time || '',
        extracted.end_time || '',
        extracted.event_description || null,
        Number(extracted.confidence),
        post.mediaUrl,
        post.permalink,
        fingerprint,
      ],
    )
    summary.inserted += 1
  }

  return summary
}
