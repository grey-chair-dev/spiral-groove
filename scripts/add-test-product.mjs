#!/usr/bin/env node
/**
 * Insert a test product into the products table so it appears in the catalog.
 * Then repopulates albums_cache so /api/products includes it.
 *
 * Usage: node scripts/add-test-product.mjs [square_variation_id]
 * Default variation ID: GGPPKCPWHTPYJY3BTNHIBCGW
 */

import dotenv from 'dotenv'
import { query } from '../api/db.js'
import { populateAlbumsCache } from '../api/albumsCache.js'

dotenv.config({ path: '.env.local' })
dotenv.config()

const VARIATION_ID = process.argv[2] || 'GGPPKCPWHTPYJY3BTNHIBCGW'

async function main() {
  console.log('Adding test product:', VARIATION_ID, '\n')

  await query(`
    INSERT INTO products (
      square_variation_id,
      square_item_id,
      name,
      variation_name,
      description,
      price_cents,
      category,
      reporting_category,
      all_categories,
      square_image_id,
      stock_count,
      updated_at,
      created_at,
      synced_at
    ) VALUES (
      $1,
      $1,
      'Test Product (Sandbox)',
      'Default',
      'Test product for checkout/sandbox.',
      1999,
      'New Vinyl',
      NULL,
      ARRAY['New Vinyl'],
      NULL,
      1,
      NOW(),
      NOW(),
      NOW()
    )
    ON CONFLICT (square_variation_id) DO UPDATE SET
      name = EXCLUDED.name,
      variation_name = EXCLUDED.variation_name,
      description = EXCLUDED.description,
      price_cents = EXCLUDED.price_cents,
      category = EXCLUDED.category,
      all_categories = EXCLUDED.all_categories,
      stock_count = EXCLUDED.stock_count,
      updated_at = EXCLUDED.updated_at,
      synced_at = EXCLUDED.synced_at
  `, [VARIATION_ID])

  console.log('✅ Product upserted into products table.\n')

  console.log('Refreshing albums_cache...')
  const result = await populateAlbumsCache()
  console.log(`✅ Albums cache refreshed (${result.albumCount} albums, ${result.durationMs}ms).\n`)
  console.log('Test product should now appear in the catalog (id: variation-' + VARIATION_ID + ')')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
