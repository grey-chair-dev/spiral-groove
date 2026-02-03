import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config() // Fallback to .env if .env.local doesn't exist
import { query } from '../api/db.js'

async function addCreatedAtIndex() {
  console.log('📊 Adding index on created_at for products_cache and albums_cache...\n')

  try {
    // Check if index already exists on products_cache
    const existingProductsIndex = await query(`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'products_cache' 
        AND indexname = 'idx_products_cache_created_at'
    `)

    if (existingProductsIndex.rows.length === 0) {
      console.log('📊 Creating index on products_cache.created_at...')
      await query(`
        CREATE INDEX idx_products_cache_created_at 
        ON products_cache (created_at DESC)
      `)
      console.log('✅ Created index on products_cache.created_at\n')
    } else {
      console.log('✅ Index idx_products_cache_created_at already exists\n')
    }

    // Check if index already exists on albums_cache
    const existingAlbumsIndex = await query(`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'albums_cache' 
        AND indexname = 'idx_albums_cache_created_at'
    `)

    if (existingAlbumsIndex.rows.length === 0) {
      console.log('📊 Creating index on albums_cache.created_at...')
      await query(`
        CREATE INDEX idx_albums_cache_created_at 
        ON albums_cache (created_at DESC)
      `)
      console.log('✅ Created index on albums_cache.created_at\n')
    } else {
      console.log('✅ Index idx_albums_cache_created_at already exists\n')
    }

    // Update table statistics
    console.log('📊 Updating table statistics...')
    await query('ANALYZE products_cache')
    await query('ANALYZE albums_cache')
    console.log('✅ Statistics updated\n')

    console.log('✅ Index creation complete!')
    console.log('   - Indexes on created_at will speed up queries filtering by date')
    console.log('   - Both products_cache and albums_cache are optimized')

  } catch (error) {
    console.error('❌ Error creating index:', error.message)
    throw error
  }
}

addCreatedAtIndex().then(() => {
  process.exit(0)
}).catch(err => {
  console.error('❌ Error:', err)
  process.exit(1)
})
