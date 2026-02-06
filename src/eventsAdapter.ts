/**
 * Events Data Adapter
 *
 * Fetches events from the Neon PostgreSQL database via /api/events.
 */

import type { Event } from '../types'

type ApiEvent = {
  id: number
  eventType: string | null
  eventName: string
  artist: string | null
  venue: string | null
  eventDescription: string
  confidence: number | null
  eventImageUrl: string | null
  eventPermalink: string | null
  fingerprint: string | null
  dateISO: string | null
  dateLabel: string | null
  startTimeLabel: string | null
  endTimeLabel: string | null
  startTime: string | null
  endTime: string | null
  startDateTimeISO: string | null
  endDateTimeISO: string | null
  createdAt: string | null
  updatedAt: string | null
}

type EventsApiResponse =
  | { success: true; events: ApiEvent[]; stale?: boolean }
  | { success: false; error?: string; message?: string }

const EVENTS_CACHE_KEY = 'sg:lastEventsCache:v1'
const EVENTS_CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000 // 24 hours

type EventsCachePayload = {
  ts: number
  events: Event[]
}

function readCachedEvents(): Event[] | null {
  try {
    const raw = localStorage.getItem(EVENTS_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as EventsCachePayload
    if (!parsed?.ts || !Array.isArray(parsed.events)) return null
    if (Date.now() - parsed.ts > EVENTS_CACHE_MAX_AGE_MS) return null
    return parsed.events
  } catch {
    return null
  }
}

function writeCachedEvents(events: Event[]) {
  try {
    const payload: EventsCachePayload = { ts: Date.now(), events }
    localStorage.setItem(EVENTS_CACHE_KEY, JSON.stringify(payload))
  } catch {
    // ignore (private mode / quota)
  }
}

function mapEventTypeToUiType(eventType: string | null | undefined): Event['type'] {
  const t = (eventType || '').toLowerCase()
  // Your schema guarantees: upcoming | same_day | recap
  // We map those into the UI's display types.
  if (t === 'recap') return 'Live Show'
  if (t === 'same_day') return 'Live Show'
  return 'Live Show'
}

function getSafeImageUrl(url: string | null | undefined): string {
  const u = (url || '')
    // strip whitespace + common invisible chars that can break URL parsing/hostnames
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim()
  if (!u) return ''
  // Minimal normalization for protocol-relative URLs.
  const normalized = u.startsWith('//') ? `https:${u}` : u

  // Instagram CDN URLs are not stable for hotlinking; proxy + cache them under our domain.
  try {
    const parsed = new URL(normalized)
    const host = (parsed.hostname || '').toLowerCase()
    if (host.includes('cdninstagram.com') || host.endsWith('.cdninstagram.com') || host.endsWith('.fbcdn.net')) {
      return `/api/image-proxy?url=${encodeURIComponent(parsed.toString())}`
    }
  } catch {
    // ignore parse errors; fall back to raw string
  }

  return normalized
}

export async function fetchEvents(): Promise<Event[]> {
  try {
    // @ts-ignore - Vite environment variables
    const apiUrl = import.meta.env.VITE_EVENTS_API_URL || '/api/events'
    // Include past events so the Events page "Archive" section can populate.
    // Server defaults to upcoming-only unless includePast=1 is provided.
    const url =
      apiUrl.startsWith('http://') || apiUrl.startsWith('https://')
        ? new URL(apiUrl)
        : new URL(apiUrl, window.location.origin)
    url.searchParams.set('includePast', '1')
    // Keep a reasonable cap; can be increased if you want deeper history.
    url.searchParams.set('pastDays', url.searchParams.get('pastDays') || '3650')

    const res = await fetch(url.toString(), { headers: { accept: 'application/json' } })
    const rawText = await res.text()

    if (!res.ok) {
      throw new Error(`Failed to fetch events: ${res.status} ${res.statusText} ${rawText || ''}`.trim())
    }

    const data = JSON.parse(rawText) as EventsApiResponse
    if (!data || data.success !== true || !Array.isArray((data as any).events)) {
      throw new Error('Invalid events response')
    }

    const mapped: Event[] = data.events.map((row) => ({
      id: String(row.id),
      title: row.eventName || '',
      description: row.eventDescription || '',
      type: mapEventTypeToUiType(row.eventType),
      imageUrl: getSafeImageUrl(row.eventImageUrl),
      date: (row.dateLabel || '').trim() || (row.dateISO || ''),
      time: (row.startTimeLabel || '').trim() || '',
      linkUrl: row.eventPermalink || undefined,
      category: row.venue || undefined,
      dateISO: row.dateISO || undefined,
      startTime: row.startDateTimeISO || row.startTime || undefined,
      endTime: row.endDateTimeISO || row.endTime || undefined,
    }))

    writeCachedEvents(mapped)
    return mapped
  } catch (e) {
    console.error('[Events] Failed to fetch events:', e)
    const cached = readCachedEvents()
    if (cached && cached.length > 0) {
      console.warn('[Events] Using cached events (last-known-good) due to fetch error')
      return cached
    }
    return []
  }
}

