#!/usr/bin/env node
/**
 * Optimize products_cache indexes by removing redundant ones
 * 
 * This script removes indexes that are:
 * - Redundant (covered by other indexes)
 * - Inefficient (COALESCE in index)
 * - Not used in queries
 * 
 * Run: node scripts/optimize-products-cache-indexes.mjs
 */

import dotenv from 'dotenv'
import { query } from '../api/db.js'

dotenv.config({ path: '.env.local' })
dotenv.config()

const INDEXES_TO_REMOVE = [
  // Redundant created_at indexes (keep idx_products_cache_created_desc)
  'products_cache_created_at_idx',
  
  // Redundant category indexes (keep products_cache_category_created_idx)
  'products_cache_category_idx',
  'idx_products_cache_category',
  
  // Redundant square_variation_id (keep UNIQUE version)
  'idx_products_cache_square_variation_id',
  
  // Inefficient COALESCE index
  'idx_products_cache_stock_date_filter',
  
  // Redundant stock composite (covered by other indexes)
  'idx_products_cache_stock_stocked_composite',
  
  // Redundant vinyl partial (covered by created_desc)
  'products_cache_vinyl_partial_idx',
  
  // Potentially unused
  'idx_products_cache_updated_at',
  'idx_products_cache_last_stocked_at', // Covered by zero_stock_recent
]

const INDEXES_TO_KEEP = [
  'products_cache_pkey', // PRIMARY KEY
  'idx_products_cache_square_variation_id_unique', // UNIQUE constraint
  'idx_products_cache_created_desc', // ORDER BY optimization
  'idx_products_cache_stock_count', // stock_count > 0 filter
  'idx_products_cache_zero_stock_recent', // zero stock + date filter
  'products_cache_category_created_idx', // category + created_at
  'idx_products_cache_square_item_id', // square_item_id lookups
  'idx_products_cache_reporting_category', // reporting queries
]

async function main() {
  console.log('🔍 Analyzing products_cache indexes...\n')
  
  // Get all current indexes
  const result = await query(`
    SELECT indexname
    FROM pg_indexes
    WHERE tablename = 'products_cache'
    ORDER BY indexname
  `)
  
  const currentIndexes = result.rows.map(r => r.indexname)
  console.log(`📊 Current indexes: ${currentIndexes.length}\n`)
  
  // Check which indexes to remove exist
  const indexesToRemove = INDEXES_TO_REMOVE.filter(name => 
    currentIndexes.includes(name)
  )
  
  if (indexesToRemove.length === 0) {
    console.log('✅ No redundant indexes found. Schema is already optimized!')
    return
  }
  
  console.log('🗑️  Indexes to remove:')
  indexesToRemove.forEach(name => {
    console.log(`   - ${name}`)
  })
  console.log()
  
  console.log('✅ Indexes to keep:')
  INDEXES_TO_KEEP.forEach(name => {
    const exists = currentIndexes.includes(name)
    console.log(`   ${exists ? '✅' : '⚠️ '} ${name}${exists ? '' : ' (not found)'}`)
  })
  console.log()
  
  // Remove indexes
  console.log('🗑️  Removing redundant indexes...\n')
  for (const indexName of indexesToRemove) {
    try {
      console.log(`   Dropping ${indexName}...`)
      await query(`DROP INDEX IF EXISTS ${indexName}`)
      console.log(`   ✅ Dropped ${indexName}`)
    } catch (error) {
      console.error(`   ❌ Failed to drop ${indexName}:`, error.message)
    }
  }
  
  // Verify final state
  const finalResult = await query(`
    SELECT indexname
    FROM pg_indexes
    WHERE tablename = 'products_cache'
    ORDER BY indexname
  `)
  
  const finalIndexes = finalResult.rows.map(r => r.indexname)
  console.log(`\n✅ Optimization complete!`)
  console.log(`   Before: ${currentIndexes.length} indexes`)
  console.log(`   After: ${finalIndexes.length} indexes`)
  console.log(`   Removed: ${currentIndexes.length - finalIndexes.length} indexes\n`)
  
  console.log('📊 Remaining indexes:')
  finalIndexes.forEach(name => {
    console.log(`   - ${name}`)
  })
  
  // Analyze table to update statistics
  console.log('\n📊 Updating table statistics...')
  await query('ANALYZE products_cache')
  console.log('✅ Statistics updated')
}

main().catch(error => {
  console.error('❌ Error:', error.message)
  console.error(error.stack)
  process.exit(1)
})
