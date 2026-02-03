#!/usr/bin/env node
/**
 * Manually populate albums_cache table
 * 
 * Run: node scripts/populate-albums-cache.mjs
 */

import dotenv from 'dotenv'
import { populateAlbumsCache } from '../api/albumsCache.js'

dotenv.config({ path: '.env.local' })
dotenv.config()

async function main() {
  console.log('🔄 Populating albums_cache table...\n')
  
  try {
    const result = await populateAlbumsCache()
    
    console.log('\n✅ Albums cache populated successfully!')
    console.log(`   Albums: ${result.albumCount}`)
    console.log(`   Duration: ${result.durationMs}ms`)
  } catch (error) {
    console.error('\n❌ Failed to populate albums cache:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

main()
