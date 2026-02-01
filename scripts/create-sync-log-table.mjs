#!/usr/bin/env node

/**
 * Create sync_log table to track cron job executions
 */

import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env.local from project root
dotenv.config({ path: join(__dirname, '..', '.env.local') })
dotenv.config({ path: join(__dirname, '..', '.env') })

import { query } from '../api/db.js'

async function createSyncLogTable() {
  console.log('📊 Creating sync_log table...')
  
  try {
    // Create sync_log table
    await query(`
      CREATE TABLE IF NOT EXISTS sync_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sync_type TEXT NOT NULL,
        status TEXT NOT NULL,
        started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        completed_at TIMESTAMPTZ,
        duration_ms INTEGER,
        items_processed INTEGER,
        items_created INTEGER,
        items_updated INTEGER,
        error_message TEXT,
        metadata JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)
    
    // Create index for querying recent syncs
    await query(`
      CREATE INDEX IF NOT EXISTS idx_sync_log_type_created 
      ON sync_log(sync_type, created_at DESC)
    `)
    
    // Create index for status queries
    await query(`
      CREATE INDEX IF NOT EXISTS idx_sync_log_status 
      ON sync_log(status, created_at DESC)
    `)
    
    console.log('✅ sync_log table created successfully')
    console.log('\n📋 Table structure:')
    console.log('   - sync_type: "products" or "sales"')
    console.log('   - status: "success" or "error"')
    console.log('   - tracks: duration, items processed, errors')
    
    return true
  } catch (error) {
    console.error('❌ Failed to create sync_log table:', error.message)
    throw error
  }
}

createSyncLogTable()
  .then(() => {
    console.log('\n✅ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error:', error)
    process.exit(1)
  })
