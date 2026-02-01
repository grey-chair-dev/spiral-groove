#!/usr/bin/env node
/**
 * Add Database Indexes for Events Table
 * 
 * Creates indexes to optimize event queries, especially for:
 * - Weekly newsletter upcoming events
 * - Events API endpoint
 * 
 * Usage: node scripts/add-events-indexes.mjs
 */

import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'
import pg from 'pg'
const { Pool } = pg

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const envPath = join(__dirname, '..', '.env.local')
try {
  const envFile = readFileSync(envPath, 'utf8')
  const envConfig = dotenv.parse(envFile)
  Object.assign(process.env, envConfig)
} catch (e) {
  // .env.local might not exist
}

const connectionString = process.env.SGR_DATABASE_URL || process.env.SPR_DATABASE_URL || process.env.DATABASE_URL
if (!connectionString) {
  console.error('❌ SGR_DATABASE_URL, SPR_DATABASE_URL, or DATABASE_URL environment variable is not set')
  process.exit(1)
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
})

async function query(text, params) {
  return await pool.query(text, params)
}

async function addIndexes() {
  console.log('[Events Indexes] Starting index creation...')
  
  try {
    // Index 1: Composite index for is_event + event_date (most common query pattern)
    console.log('[Events Indexes] Creating composite index on (is_event, event_date)...')
    await query(`
      CREATE INDEX IF NOT EXISTS events_is_event_date_idx 
      ON events (is_event, event_date ASC)
      WHERE is_event = true
    `)
    console.log('  ✓ Created events_is_event_date_idx')
    
    // Index 2: Index on event_date alone (for date range queries)
    // Note: Can't use CURRENT_DATE in index predicate (not immutable)
    // Instead, create a regular index - PostgreSQL will use it efficiently
    console.log('[Events Indexes] Creating index on event_date...')
    await query(`
      CREATE INDEX IF NOT EXISTS events_event_date_idx 
      ON events (event_date ASC)
    `)
    console.log('  ✓ Created events_event_date_idx')
    
    // Index 3: Index on is_event (for filtering events vs products)
    console.log('[Events Indexes] Creating index on is_event...')
    await query(`
      CREATE INDEX IF NOT EXISTS events_is_event_idx 
      ON events (is_event)
      WHERE is_event = true
    `)
    console.log('  ✓ Created events_is_event_idx')
    
    // Index 4: Composite index for sorting (event_date + start_time)
    console.log('[Events Indexes] Creating composite index for sorting...')
    await query(`
      CREATE INDEX IF NOT EXISTS events_date_time_sort_idx 
      ON events (event_date ASC, start_time ASC, id ASC)
      WHERE is_event = true
    `)
    console.log('  ✓ Created events_date_time_sort_idx')
    
    console.log('\n✅ All indexes created successfully!')
    
    // Analyze the table to update statistics
    console.log('\n[Events Indexes] Analyzing table to update statistics...')
    await query('ANALYZE events')
    console.log('  ✓ Table analyzed')
    
  } catch (error) {
    console.error('❌ Error creating indexes:', error.message)
    console.error('Stack:', error.stack)
    throw error
  } finally {
    await pool.end()
  }
}

addIndexes()
  .then(() => {
    console.log('\n🎉 Done! Query performance should be improved.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error)
    process.exit(1)
  })
