import 'dotenv/config'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config()
import { query } from '../api/db.js'

async function optimizeDatabase() {
  console.log('🚀 Optimizing database performance...\n')

  try {
    // 1. Add missing indexes on staff_picks (critical for matching products)
    console.log('📊 Adding indexes to staff_picks...')
    await query(`
      CREATE INDEX IF NOT EXISTS idx_staff_picks_square_variation_id 
      ON staff_picks (square_variation_id)
    `)
    await query(`
      CREATE INDEX IF NOT EXISTS idx_staff_picks_square_item_id 
      ON staff_picks (square_item_id)
    `)
    await query(`
      CREATE INDEX IF NOT EXISTS idx_staff_picks_created_at 
      ON staff_picks (created_at DESC)
    `)
    console.log('✅ staff_picks indexes created\n')

    // 2. Add missing index on albums_cache.square_item_id
    console.log('📊 Adding index to albums_cache.square_item_id...')
    await query(`
      CREATE INDEX IF NOT EXISTS idx_albums_cache_square_item_id 
      ON albums_cache (square_item_id)
    `)
    console.log('✅ albums_cache.square_item_id index created\n')

    // 3. Add composite index for the WHERE clause in products query
    console.log('📊 Optimizing albums_cache query indexes...')
    await query(`
      CREATE INDEX IF NOT EXISTS idx_albums_cache_stock_date_composite 
      ON albums_cache (stock_count, last_stocked_at, created_at DESC)
      WHERE stock_count = 0
    `)
    await query(`
      CREATE INDEX IF NOT EXISTS idx_albums_cache_stock_positive 
      ON albums_cache (created_at DESC, id ASC)
      WHERE stock_count > 0
    `)
    console.log('✅ albums_cache composite indexes created\n')

    // 4. Add indexes on events for faster queries
    console.log('📊 Adding indexes to events...')
    await query(`
      CREATE INDEX IF NOT EXISTS idx_events_created_at 
      ON events (created_at DESC)
    `)
    console.log('✅ events indexes created\n')

    // 5. Add indexes on order_items (has 4,112 sequential scans!)
    console.log('📊 Adding indexes to order_items...')
    await query(`
      CREATE INDEX IF NOT EXISTS idx_order_items_order_id 
      ON order_items (order_id)
    `)
    await query(`
      CREATE INDEX IF NOT EXISTS idx_order_items_product_id 
      ON order_items (product_id)
    `)
    await query(`
      CREATE INDEX IF NOT EXISTS idx_order_items_created_at 
      ON order_items (created_at DESC)
    `)
    console.log('✅ order_items indexes created\n')

    // 5b. Speed up order lookup endpoints (/api/orders, /api/orders/update)
    // These endpoints filter on:
    // - orders.order_number
    // - orders.square_order_id
    // - pickup_details->>'email' (case-insensitive)
    // - pickup_details->>'phone'
    console.log('📊 Adding indexes to orders lookup keys...')
    await query(`
      CREATE INDEX IF NOT EXISTS idx_orders_order_number
      ON orders (order_number)
    `)
    await query(`
      CREATE INDEX IF NOT EXISTS idx_orders_square_order_id
      ON orders (square_order_id)
    `)
    await query(`
      CREATE INDEX IF NOT EXISTS idx_orders_created_at_desc
      ON orders (created_at DESC)
    `)
    await query(`
      CREATE INDEX IF NOT EXISTS idx_orders_pickup_email_lower
      ON orders ((lower(coalesce(pickup_details->>'email',''))))
    `)
    await query(`
      CREATE INDEX IF NOT EXISTS idx_orders_pickup_phone
      ON orders ((coalesce(pickup_details->>'phone','')))
    `)
    console.log('✅ orders lookup indexes created\n')

    // 5c. Speed up customer lookups in /api/pay
    console.log('📊 Adding indexes to customers...')
    await query(`
      CREATE INDEX IF NOT EXISTS idx_customers_email
      ON customers (email)
    `)
    await query(`
      CREATE INDEX IF NOT EXISTS idx_customers_square_customer_id
      ON customers (square_customer_id)
    `)
    console.log('✅ customers indexes created\n')

    // 6. Analyze tables to update statistics
    console.log('📊 Updating table statistics...')
    await query('ANALYZE products_cache')
    await query('ANALYZE albums_cache')
    await query('ANALYZE staff_picks')
    await query('ANALYZE events')
    await query('ANALYZE order_items')
    await query('ANALYZE orders')
    await query('ANALYZE customers')
    console.log('✅ Statistics updated\n')

    // 7. Check current index usage
    console.log('📊 Verifying index creation...')
    const indexes = await query(`
      SELECT 
        tablename,
        indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename IN ('staff_picks', 'albums_cache', 'events', 'order_items', 'orders', 'customers')
      ORDER BY tablename, indexname
    `)
    
    console.log('✅ Created indexes:')
    indexes.rows.forEach(row => {
      console.log(`   ${row.tablename}.${row.indexname}`)
    })

    console.log('\n✅ Database optimization complete!')
    console.log('   - Added missing indexes on frequently queried columns')
    console.log('   - Created composite indexes for common query patterns')
    console.log('   - Updated table statistics for better query planning')
    console.log('\n💡 These indexes should significantly reduce sequential scans')

  } catch (error) {
    console.error('❌ Error optimizing database:', error.message)
    throw error
  }
}

optimizeDatabase().then(() => {
  process.exit(0)
}).catch(err => {
  console.error('❌ Error:', err)
  process.exit(1)
})
