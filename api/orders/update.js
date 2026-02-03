
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
    const { order_id, status, forceEmail } = body

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

    // Try to find order by square_order_id first, then by order_number.
    // Derive customer email/name from pickup_details (JSONB) to avoid depending on other tables.
    const orderResult = await query(
      `SELECT 
         o.id,
         o.order_number,
         o.square_order_id,
         o.status as current_status,
         o.total_cents,
         o.pickup_details
       FROM orders o
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
    const pickupDetails =
      order.pickup_details && typeof order.pickup_details === 'string'
        ? (() => { try { return JSON.parse(order.pickup_details) } catch { return {} } })()
        : (order.pickup_details || {})

    const customerEmail = pickupDetails?.email || null
    const customerName =
      [pickupDetails?.firstName, pickupDetails?.lastName].filter(Boolean).join(' ') || 'Valued Customer'

    const prevUpper = String(previousStatus || '').toUpperCase().trim()
    const nextUpper = String(status || '').toUpperCase().trim()
    const wasComplete = prevUpper === 'COMPLETED' || prevUpper === 'PICKED_UP' || prevUpper === 'DELIVERED'
    const isComplete = nextUpper === 'COMPLETED' || nextUpper === 'PICKED_UP' || nextUpper === 'DELIVERED'

    // Update the order status and fetch the updated row in one round-trip.
    const updatedOrder = await query(
      `UPDATE orders
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING
         id,
         order_number,
         square_order_id,
         status,
         total_cents,
         updated_at,
         pickup_details`,
      [status, dbOrderId],
    )

    const updatedPickup =
      updatedOrder.rows[0]?.pickup_details && typeof updatedOrder.rows[0].pickup_details === 'string'
        ? (() => { try { return JSON.parse(updatedOrder.rows[0].pickup_details) } catch { return {} } })()
        : (updatedOrder.rows[0]?.pickup_details || {})

    const itemsFromPickup = Array.isArray(updatedPickup?.items) ? updatedPickup.items : []

    // Send email notification if status changed and customer email exists
    console.log(`[Orders Update API] Checking email conditions:`, {
      previousStatus,
      newStatus: status,
      statusChanged: previousStatus !== status,
      customerEmail: customerEmail ? 'exists' : 'missing',
      orderNumber: order.order_number,
    })
    
    let emailAttempted = false
    let emailSent = false
    let emailSkipReason = null
    let reviewEmailAttempted = false
    let reviewEmailSent = false
    let reviewEmailSkipReason = null

    if (!forceEmail && previousStatus === status) {
      emailSkipReason = 'status_unchanged'
    } else if (!customerEmail) {
      emailSkipReason = 'missing_customer_email'
    } else if (!process.env.MAKE_EMAIL_WEBHOOK_URL) {
      emailSkipReason = 'missing_MAKE_EMAIL_WEBHOOK_URL'
    }

    if (!emailSkipReason) {
      try {
        const { sendEmail } = await import('../sendEmail.js')
        const total = order.total_cents ? (Number(order.total_cents) / 100).toFixed(2) : '0.00'
        
        console.log(`[Orders Update API] Sending status update email to ${customerEmail} for order ${order.order_number}`)
        
        const sendResult = await sendEmail({
          type: 'order_status_update',
          to: customerEmail,
          subject: `Order Status Update ${order.order_number} - Spiral Groove Records`,
          data: {
            orderNumber: order.order_number,
            customerName,
            customerEmail,
            status: status,
            previousStatus: previousStatus,
            items: itemsFromPickup.map((item) => ({
              name: item?.name || '',
              quantity: Number(item?.quantity) || 0,
              price: Number(item?.price) || 0,
            })),
            total: total,
            currency: 'USD',
            deliveryMethod: 'pickup',
            pickupLocation: pickupDetails.address || '215B Main Street, Milford, OH 45150',
          },
          dedupeKey: `order_status_update:${order.order_number}:${status}`,
          force: Boolean(forceEmail),
        })
        emailAttempted = Boolean(sendResult?.attempted)
        emailSent = Boolean(sendResult?.ok)
        if (!sendResult?.ok) {
          emailSkipReason = sendResult?.reason || 'send_failed'
        }
        console.log(`[Orders Update API] ✅ Status update email result for order ${order.order_number}`, sendResult)
      } catch (emailError) {
        console.error('[Orders Update API] ❌ Failed to send status update email:', emailError)
        console.error('[Orders Update API] Error details:', emailError.stack)
        emailSent = false
        emailSkipReason = 'send_failed'
        // Don't fail the request if email fails
      }
    } else {
      console.log(`[Orders Update API] ⚠️  Skipping email: ${emailSkipReason}`, {
        previousStatus,
        status,
        customerEmail: customerEmail ? 'exists' : 'missing',
        hasWebhook: Boolean(process.env.MAKE_EMAIL_WEBHOOK_URL),
      })
    }

    // Separate review request email when picked up / completed (transition only, unless forced).
    // This runs independently of the status-update email (so dedupe/skip on the status email won't block reviews).
    try {
      const { sendEmail } = await import('../sendEmail.js')

      if (!customerEmail) {
        reviewEmailSkipReason = 'missing_customer_email'
      } else if (!process.env.MAKE_EMAIL_WEBHOOK_URL) {
        reviewEmailSkipReason = 'missing_MAKE_EMAIL_WEBHOOK_URL'
      } else if (!isComplete) {
        reviewEmailSkipReason = 'not_completed_status'
      } else if (!forceEmail && wasComplete) {
        // Only send on transition into completed state unless forced.
        reviewEmailSkipReason = 'already_completed'
      }

      if (!reviewEmailSkipReason) {
        const reviewResult = await sendEmail({
          type: 'review_request',
          to: customerEmail,
          subject: 'How was your visit? Leave a quick review',
          data: {
            orderNumber: order.order_number,
            customerName,
          },
          dedupeKey: `review_request:${order.order_number}`,
          force: Boolean(forceEmail),
        })
        reviewEmailAttempted = Boolean(reviewResult?.attempted)
        reviewEmailSent = Boolean(reviewResult?.ok)
        if (!reviewResult?.ok) {
          reviewEmailSkipReason = reviewResult?.reason || 'send_failed'
        }
        console.log(`[Orders Update API] ✅ Review request email result for order ${order.order_number}`, reviewResult)
      } else {
        console.log(`[Orders Update API] ⚠️  Skipping review email: ${reviewEmailSkipReason}`, {
          previousStatus,
          status,
          customerEmail: customerEmail ? 'exists' : 'missing',
          forceEmail: Boolean(forceEmail),
        })
      }
    } catch (reviewErr) {
      console.error('[Orders Update API] ❌ Failed to send review request email:', reviewErr)
      reviewEmailAttempted = true
      reviewEmailSent = false
      reviewEmailSkipReason = 'send_failed'
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        order: updatedOrder.rows[0],
        message: `Order status updated to: ${status}`,
        email: {
          attempted: emailAttempted,
          sent: emailSent,
          skipReason: emailSkipReason,
          to: customerEmail || null,
          force: Boolean(forceEmail),
        }
        ,
        reviewEmail: {
          attempted: reviewEmailAttempted,
          sent: reviewEmailSent,
          skipReason: reviewEmailSkipReason,
          to: customerEmail || null,
          force: Boolean(forceEmail),
        }
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
