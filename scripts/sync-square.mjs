import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config()

import { syncSquareToNeon } from '../api/squareSync.js'

const full = true

console.log('[sync:square] Starting Square → Neon sync…')
const startedAt = Date.now()

try {
  const result = await syncSquareToNeon({ full })
  const ms = Date.now() - startedAt
  console.log('[sync:square] ✅ Done', { ...result, durationMs: ms })
  process.exit(0)
} catch (e) {
  console.error('[sync:square] ❌ Failed:', e?.message || e)
  process.exit(1)
}

