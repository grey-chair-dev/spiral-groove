
import { query } from '../db.js'

export const config = {
  runtime: 'nodejs',
}

/**
 * POST /api/inventory/log
 * 
 * Logs inventory changes from Square webhooks via Make.com.
 * This creates a record in the inventory table for tracking purposes.
 * 
 * Request Body:
 * {
 *   square_variation_id: string,  // Square variation ID (e.g., 'UKCEICV73K2RXTV26224TJGI')
 *   quantity_change: number,      // Change in quantity (can be negative)
 *   reason?: string,              // Optional: reason for change (e.g., 'inventory.count.updated')
 *   notes?: string                // Optional: additional notes
 * }
 * 
 * Note: Also accepts 'variation_id' or 'product_id' for backwards compatibility
 */
export default async function handler(request) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Method not allowed. Use POST.' 
      }),
      { 
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    // Optional: Add webhook secret validation for security
    const webhookSecret = request.headers.get('x-webhook-secret')
    if (process.env.WEBHOOK_SECRET && webhookSecret !== process.env.WEBHOOK_SECRET) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Unauthorized. Invalid webhook secret.' 
        }), 
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const body = await request.json()
    const { product_id, variation_id, square_variation_id, quantity_change, reason, notes } = body

    // Support both product_id (legacy), variation_id, and square_variation_id
    const squareVariationId = body.square_variation_id || variation_id || product_id

    if (!squareVariationId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing square_variation_id (or variation_id/product_id) in request body.' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    if (quantity_change === undefined || quantity_change === null) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing quantity_change in request body.' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Insert inventory change record
    const result = await query(
      `INSERT INTO inventory (square_variation_id, quantity_change, reason, notes, created_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       RETURNING id, square_variation_id, quantity_change, reason, notes, created_at`,
      [squareVariationId, quantity_change, reason || null, notes || null]
    )

    const inventoryRecord = result.rows[0]

    // Update products_cache stock_count if product exists (match by square_variation_id)
    // This keeps products_cache in sync with inventory changes
    try {
      await query(
        `UPDATE products_cache 
         SET stock_count = stock_count + $1, updated_at = CURRENT_TIMESTAMP
         WHERE square_variation_id = $2`,
        [quantity_change, squareVariationId]
      )
    } catch (updateErr) {
      // Log but don't fail - product might not exist in cache yet
      console.warn(`[Inventory Log] Could not update products_cache for variation ${squareVariationId}:`, updateErr.message)
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        inventory: inventoryRecord,
        message: 'Inventory change logged successfully'
      }),
      {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    )

  } catch (error) {
    console.error('[Inventory Log API] Failed to log inventory change:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to log inventory change',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
