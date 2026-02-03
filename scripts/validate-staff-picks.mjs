import 'dotenv/config'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config()
import { query } from '../api/db.js'

async function validateStaffPicks() {
  console.log('🔍 Validating staff picks against products_cache...\n')

  try {
    // Get all staff picks
    const staffPicks = await query(`
      SELECT 
        id,
        square_item_id,
        square_variation_id,
        name,
        quote,
        created_at
      FROM staff_picks
      ORDER BY created_at DESC
    `)

    console.log(`📊 Found ${staffPicks.rows.length} staff picks\n`)

    if (staffPicks.rows.length === 0) {
      console.log('⚠️  No staff picks found in database')
      return
    }

    // Check which staff picks have matching products
    const variationIds = staffPicks.rows.map(r => r.square_variation_id).filter(Boolean)
    
    const matchingProducts = await query(`
      SELECT 
        id,
        square_variation_id,
        name
      FROM products_cache
      WHERE square_variation_id = ANY($1::text[])
    `, [variationIds])

    const matchingIds = new Set(matchingProducts.rows.map(p => p.square_variation_id))
    
    console.log('📦 Validation Results:\n')
    let validCount = 0
    let invalidCount = 0

    staffPicks.rows.forEach((pick, idx) => {
      const hasMatch = matchingIds.has(pick.square_variation_id)
      if (hasMatch) {
        validCount++
        const product = matchingProducts.rows.find(p => p.square_variation_id === pick.square_variation_id)
        console.log(`✅ ${idx + 1}. ${pick.name} - ${pick.square_variation_id}`)
        console.log(`   Product: ${product.name}`)
      } else {
        invalidCount++
        console.log(`❌ ${idx + 1}. ${pick.name} - ${pick.square_variation_id}`)
        console.log(`   ⚠️  No matching product found in products_cache`)
      }
    })

    console.log(`\n📈 Summary:`)
    console.log(`   Valid: ${validCount}`)
    console.log(`   Invalid: ${invalidCount}`)
    console.log(`   Total: ${staffPicks.rows.length}`)

    if (invalidCount > 0) {
      console.log(`\n💡 Tip: Update or remove invalid staff picks to ensure they display on the homepage`)
    }

  } catch (error) {
    console.error('❌ Error validating staff picks:', error.message)
    throw error
  }
}

validateStaffPicks().then(() => {
  process.exit(0)
}).catch(err => {
  console.error('❌ Error:', err)
  process.exit(1)
})
