#!/usr/bin/env node
/**
 * Ensure events table schema exists (one-off).
 *
 * This used to run inside /api/events on request, which added extra DB queries.
 * Run this script manually when you need to (or during provisioning).
 *
 * Run:
 *   node scripts/ensure-events-schema.mjs
 */

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config()

import { query } from '../api/db.js'

async function main() {
  console.log('🧱 Ensuring events schema...')

  await query(`
    CREATE TABLE IF NOT EXISTS events (
      id BIGSERIAL PRIMARY KEY,
      is_event BOOLEAN DEFAULT TRUE,
      event_type TEXT,
      event_name TEXT,
      artist TEXT,
      venue TEXT,
      event_date DATE,
      start_time TIME,
      end_time TIME,
      event_description TEXT,
      confidence NUMERIC,
      event_image_url TEXT,
      event_permalink TEXT,
      fingerprint TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Optional: idempotently add columns for older tables
  await query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS is_event BOOLEAN DEFAULT TRUE`)
  await query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS event_type TEXT`)
  await query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS event_name TEXT`)
  await query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS artist TEXT`)
  await query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS venue TEXT`)
  await query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS event_date DATE`)
  await query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS start_time TIME`)
  await query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS end_time TIME`)
  await query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS event_description TEXT`)
  await query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS confidence NUMERIC`)
  await query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS event_image_url TEXT`)
  await query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS event_permalink TEXT`)
  await query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS fingerprint TEXT`)
  await query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP`)
  await query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP`)

  console.log('✅ events schema ensured')
}

main().catch((e) => {
  console.error('❌ Failed to ensure events schema:', e?.message || e)
  console.error(e?.stack || '')
  process.exit(1)
})

