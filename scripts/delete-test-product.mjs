#!/usr/bin/env node
/**
 * Remove the test product from the products table and refresh albums_cache.
 *
 * Usage: node scripts/delete-test-product.mjs
 */

import dotenv from 'dotenv'
import { query } from '../api/db.js'
import { populateAlbumsCache } from '../api/albumsCache.js'

dotenv.config({ path: '.env.local' })
dotenv.config()

const TEST_PRODUCT_NAME = 'Test Product (Sandbox)'
const DEFAULT_VARIATION_ID = 'GGPPKCPWHTPYJY3BTNHIBCGW'

async function main() {
  console.log('Deleting test product...\n')

  const r = await query(
    `DELETE FROM products
     WHERE name = $1 OR square_variation_id = $2
     RETURNING square_variation_id, name`,
    [TEST_PRODUCT_NAME, DEFAULT_VARIATION_ID]
  )

  const deletedProducts = r?.rowCount ?? 0
  if (deletedProducts > 0) {
    console.log(`✅ Deleted ${deletedProducts} row(s) from products (${(r.rows || []).map((row) => row.name || row.square_variation_id).join(', ')}).\n`)
  } else {
    console.log('No test product in products table.\n')
  }

  const ac = await query(
    `DELETE FROM albums_cache
     WHERE name = $1 OR square_variation_id = $2
     RETURNING id, name`,
    [TEST_PRODUCT_NAME, DEFAULT_VARIATION_ID]
  )
  const deletedCache = ac?.rowCount ?? 0
  if (deletedCache > 0) {
    console.log(`✅ Deleted ${deletedCache} row(s) from albums_cache.\n`)
  }

  // Rebuild albums_cache and products_api_cache so /api/products stops serving the test product.
  // (products_api_cache and in-memory cache otherwise keep the old list.)
  console.log('Refreshing albums_cache and products_api_cache...')
  const result = await populateAlbumsCache()
  console.log(`✅ Cache refreshed (${result.albumCount} albums, ${result.durationMs}ms).\n`)

  console.log('Done. Restart the dev server (or wait ~30s) so in-memory products cache clears.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
