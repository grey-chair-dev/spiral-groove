/**
 * Client helpers for Vercel Flags exposed via `/api/flags/*`.
 * Server-side evaluation uses `api/flags/registry.js` + FLAGS / FLAGS_SECRET.
 */

export type SubscriptionFlagResponse =
  | { success: true; key: 'subscription'; value: boolean }
  | { success: false; error: string }

export async function fetchSubscriptionFlag(): Promise<boolean> {
  try {
    const res = await fetch('/api/flags/subscription', {
      credentials: 'include',
    })
    const data = (await res.json()) as SubscriptionFlagResponse
    if (data.success && typeof data.value === 'boolean') {
      return data.value
    }
  } catch {
    // ignore
  }
  return false
}
