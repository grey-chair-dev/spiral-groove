import type { StaffPick } from '../types'

export type StaffPickMetaRow = {
  id: number | string
  square_item_id: string
  square_variation_id: string
  name: string
  quote: string
  created_at?: string
}

type StaffPicksCachePayload = { ts: number; rows: StaffPickMetaRow[] }

// Bump this key when the API semantics change so we don't keep stale/dangling variation IDs in localStorage.
const STAFF_PICKS_CACHE_KEY = 'sg_staff_picks_v2'
const STAFF_PICKS_CACHE_TTL_MS = 60 * 1000 // 1 minute

const warnedMissingVariationIds = new Set<string>()

function readCachedRows(): StaffPickMetaRow[] | null {
  try {
    const raw = localStorage.getItem(STAFF_PICKS_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StaffPicksCachePayload
    if (!parsed?.ts || !Array.isArray(parsed.rows)) return null
    if (Date.now() - parsed.ts > STAFF_PICKS_CACHE_TTL_MS) return null
    return parsed.rows
  } catch {
    return null
  }
}

function writeCachedRows(rows: StaffPickMetaRow[]) {
  try {
    const payload: StaffPicksCachePayload = { ts: Date.now(), rows }
    localStorage.setItem(STAFF_PICKS_CACHE_KEY, JSON.stringify(payload))
  } catch {
    // ignore
  }
}

export async function fetchStaffPickMeta(limit: number = 12): Promise<StaffPickMetaRow[]> {
  const cached = readCachedRows()
  if (cached) return cached

  const res = await fetch(`/api/staff-picks?limit=${encodeURIComponent(String(limit))}`)
  if (!res.ok) throw new Error(`Failed to fetch staff picks (${res.status})`)
  const data = await res.json()
  const rows = Array.isArray(data?.staffPicks) ? (data.staffPicks as StaffPickMetaRow[]) : []
  writeCachedRows(rows)
  return rows
}

export function mergeStaffPicks(products: any[], rows: StaffPickMetaRow[]): StaffPick[] {
  // Create maps for both ID and square_variation_id lookups
  const byId = new Map<string, any>()
  const bySquareVariationId = new Map<string, any>()
  
  for (const p of products || []) {
    if (p?.id) {
      byId.set(String(p.id), p)
      // Also index by square_variation_id if available (from the product's square_variation_id or extracted from id)
      if (p.squareVariationId) {
        bySquareVariationId.set(String(p.squareVariationId), p)
      }
      // Extract square_variation_id from id if it's in format "variation-{id}"
      if (p.id.startsWith('variation-')) {
        const rawId = p.id.replace(/^variation-/, '')
        bySquareVariationId.set(rawId, p)
      }
    }
  }

  const picks: StaffPick[] = []

  for (const row of rows || []) {
    const rawVarId = String(row.square_variation_id || '').trim()
    if (!rawVarId) continue
    
    // Try multiple lookup strategies
    const candidateIds = rawVarId.startsWith('variation-') ? [rawVarId] : [`variation-${rawVarId}`, rawVarId]
    
    // First try by ID (with variation- prefix)
    let product = candidateIds.map((id) => byId.get(id)).find(Boolean)
    
    // If not found, try by square_variation_id directly
    if (!product) {
      product = bySquareVariationId.get(rawVarId)
    }
    
    // Still not found? Try without any prefix
    if (!product && !rawVarId.startsWith('variation-')) {
      product = byId.get(rawVarId)
    }
    
    if (!product) {
      // Log for debugging but don't break - just skip this pick
      if (!warnedMissingVariationIds.has(rawVarId)) {
        warnedMissingVariationIds.add(rawVarId)
        console.warn(`[StaffPicks] Could not find product for staff pick variation ID: ${rawVarId}`)
      }
      continue
    }

    const staffName = String(row.name || 'Staff').trim() || 'Staff'
    const seed = encodeURIComponent(staffName.toLowerCase().replace(/\s+/g, '-'))
    const staffImage = `https://picsum.photos/seed/${seed}/100/100`

    picks.push({
      ...product,
      staffName,
      staffNote: String(row.quote || '').trim(),
      staffImage,
    })
  }

  return picks
}

