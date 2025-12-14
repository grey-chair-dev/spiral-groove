
import { query } from '../db.js'
import { withWebHandler } from '../_vercelNodeAdapter.js'

export const config = {
  runtime: 'nodejs',
}

/**
 * PATCH /api/orders/update
 * 
 * Updates an order status in the Neon database.
 * Designed to be called by Make.com webhooks when Square order status changes.
 * 
 * Request Body:
 * {
 *   order_id: string,        // Square order ID or our order_number
 *   status: string,          // New status (e.g., 'COMPLETED', 'SHIPPED', 'CANCELLED')
 * }
 */
export async function webHandler(request) {
  // Only allow PATCH requests
  if (request.method !== 'PATCH') {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Method not allowed. Use PATCH.' 
      }),
      { 
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    // Optional: Add webhook secret validation for security
    // Uncomment and set WEBHOOK_SECRET in your environment variables
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
    const { order_id, status } = body

    if (!order_id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing order_id in request body.' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    if (!status) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing status in request body.' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Try to find order by square_order_id first, then by order_number
    const orderResult = await query(
      `SELECT id FROM orders 
       WHERE square_order_id = $1 OR order_number = $1 
       LIMIT 1`,
      [order_id]
    )

    if (orderResult.rows.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Order not found: ${order_id}` 
        }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const dbOrderId = orderResult.rows[0].id

    // Update the order status
    await query(
      `UPDATE orders 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [status, dbOrderId]
    )

    // Fetch updated order
    const updatedOrder = await query(
      `SELECT 
         id,
         order_number,
         square_order_id,
         status,
         updated_at
       FROM orders
       WHERE id = $1`,
      [dbOrderId]
    )

    return new Response(
      JSON.stringify({ 
        success: true,
        order: updatedOrder.rows[0],
        message: `Order status updated to: ${status}`
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
    console.error('[Orders Update API] Failed to update order:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to update order',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

export default withWebHandler(webHandler)
