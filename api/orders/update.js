
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
    // Also fetch customer email and order details for email notification
    const orderResult = await query(
      `SELECT 
         o.id,
         o.order_number,
         o.square_order_id,
         o.status as current_status,
         o.total_cents,
         o.pickup_details,
         c.email as customer_email,
         CONCAT(c.first_name, ' ', c.last_name) as customer_name
       FROM orders o
       LEFT JOIN customers c ON o.customer_id = c.id
       WHERE o.square_order_id = $1 OR o.order_number = $1 
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

    const order = orderResult.rows[0]
    const dbOrderId = order.id
    const previousStatus = order.current_status

    // Update the order status
    await query(
      `UPDATE orders 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [status, dbOrderId]
    )

    // Fetch updated order with items for email
    const updatedOrder = await query(
      `SELECT 
         o.id,
         o.order_number,
         o.square_order_id,
         o.status,
         o.total_cents,
         o.updated_at,
         c.email as customer_email,
         CONCAT(c.first_name, ' ', c.last_name) as customer_name
       FROM orders o
       LEFT JOIN customers c ON o.customer_id = c.id
       WHERE o.id = $1`,
      [dbOrderId]
    )

    // Fetch order items for email
    const orderItems = await query(
      `SELECT 
         name,
         quantity,
         price_cents
       FROM order_items
       WHERE order_id = $1`,
      [dbOrderId]
    )

    // Send email notification if status changed and customer email exists
    console.log(`[Orders Update API] Checking email conditions:`, {
      previousStatus,
      newStatus: status,
      statusChanged: previousStatus !== status,
      customerEmail: order.customer_email ? 'exists' : 'missing',
      orderNumber: order.order_number,
    })
    
    if (previousStatus !== status && order.customer_email) {
      try {
        const { sendEmail } = await import('../sendEmail.js')
        const total = order.total_cents ? (Number(order.total_cents) / 100).toFixed(2) : '0.00'
        const pickupDetails = order.pickup_details ? JSON.parse(order.pickup_details) : {}
        
        console.log(`[Orders Update API] Sending status update email to ${order.customer_email} for order ${order.order_number}`)
        
        await sendEmail({
          type: 'order_status_update',
          to: order.customer_email,
          subject: `Order Status Update ${order.order_number} - Spiral Groove Records`,
          data: {
            orderNumber: order.order_number,
            customerName: order.customer_name || 'Valued Customer',
            customerEmail: order.customer_email,
            status: status,
            previousStatus: previousStatus,
            items: orderItems.rows.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price_cents ? (Number(item.price_cents) / 100) : 0,
            })),
            total: total,
            currency: 'USD',
            deliveryMethod: 'pickup',
            pickupLocation: pickupDetails.address || '215B Main Street, Milford, OH 45150',
          },
          dedupeKey: `order_status_update:${order.order_number}:${status}`,
        })
        console.log(`[Orders Update API] ✅ Status update email sent for order ${order.order_number}`)
      } catch (emailError) {
        console.error('[Orders Update API] ❌ Failed to send status update email:', emailError)
        console.error('[Orders Update API] Error details:', emailError.stack)
        // Don't fail the request if email fails
      }
    } else {
      if (previousStatus === status) {
        console.log(`[Orders Update API] ⚠️  Status unchanged (${status}), skipping email`)
      }
      if (!order.customer_email) {
        console.log(`[Orders Update API] ⚠️  No customer email found for order ${order.order_number}, skipping email`)
      }
    }

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
