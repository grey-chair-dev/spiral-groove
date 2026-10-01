
import { query } from '../db.js'
import { withWebHandler } from '../_vercelNodeAdapter.js'
import { normalizeOrderStatus } from '../orderStatusNormalize.js'
import { claimEmailSend, releaseEmailSend } from '../emailDedupe.js'

export const config = {
  runtime: 'nodejs',
}

function getOrderStatusUpdateSubject(status, orderNumber) {
  const number = String(orderNumber || '').trim()
  const suffix = number ? ` ${number} - Spiral Groove Records` : ' - Spiral Groove Records'
  const upper = String(status || '').toUpperCase().trim()

  if (upper === 'PREPARED' || upper === 'READY' || upper === 'READY_FOR_PICKUP') {
    return `Ready for pickup:${suffix}`
  }
  if (upper === 'SHIPPED') {
    return `Your order has shipped:${suffix}`
  }
  if (upper === 'COMPLETED' || upper === 'DELIVERED' || upper === 'PICKED_UP') {
    return `Order complete:${suffix}`
  }
  if (upper === 'CANCELLED' || upper === 'CANCELED') {
    return `Order cancelled:${suffix}`
  }
  return number ? `Order Status Update ${number} - Spiral Groove Records` : 'Order Status Update - Spiral Groove Records'
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
 *   status: string,          // New status (e.g., 'PREPARED', 'COMPLETED', 'CANCELLED')
 *   fulfillment_state?: string, // Square pickup fulfillment state (preferred for mapping)
 *   forceEmail?: boolean,   // send even if the stored status already matches (does not skip dedupe)
 *   resend?: boolean,        // send this status again; bypasses email_sends dedupe
 * }
 *
 * Status values are normalized via orderStatusNormalize.js (Square "Ready" → PREPARED).
 * See docs/make-order-status-sync.md for Make.com scenario setup.
 */
export async function webHandler(request) {
  // Allow PATCH (preferred) and POST (common webhook default)
  const method = (request.method || 'GET').toUpperCase()
  if (method !== 'PATCH' && method !== 'POST') {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Method not allowed. Use PATCH or POST.' 
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
    const {
      order_id: orderId,
      square_order_id: squareOrderId,
      order_number: orderNumber,
      status,
      forceEmail,
      resend,
      trackingNumber,
      trackingUrl,
    } = body
    // Make sends forceEmail on every webhook so a status Postgres already wrote still mails.
    // That must not skip dedupe: Square emits several versions while the order is still PROPOSED.
    // resend is the explicit "send this status again" switch (manual fixes).
    const resendEmail = Boolean(resend)

    // Accept aliases so Make/Square payloads don't have to be reshaped.
    const lookupId = orderId || squareOrderId || orderNumber

    if (!lookupId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing order identifier in request body (order_id, square_order_id, or order_number).' 
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
      [lookupId]
    )

    if (orderResult.rows.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Order not found: ${lookupId}` 
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

    const { status: normalizedStatus, rawStatus, reason: normalizeReason } = normalizeOrderStatus(
      { ...body, status },
      { pickup_details: pickupDetails, delivery_method: order.delivery_method, status: previousStatus },
    )

    if (rawStatus && normalizedStatus !== String(rawStatus).trim().toUpperCase()) {
      console.log('[Orders Update API] Normalized status', {
        orderNumber: order.order_number,
        rawStatus,
        normalizedStatus,
        normalizeReason,
        fulfillment_state: body?.fulfillment_state || body?.fulfillmentState || null,
      })
    }

    const customerEmail = pickupDetails?.email || null
    const customerName =
      [pickupDetails?.firstName, pickupDetails?.lastName].filter(Boolean).join(' ') || 'Valued Customer'

    const prevUpper = String(previousStatus || '').toUpperCase().trim()
    const nextUpper = String(normalizedStatus || '').toUpperCase().trim()
    const wasComplete = prevUpper === 'COMPLETED' || prevUpper === 'PICKED_UP' || prevUpper === 'DELIVERED'
    const isComplete = nextUpper === 'COMPLETED' || nextUpper === 'PICKED_UP' || nextUpper === 'DELIVERED'

    // Merge optional tracking into pickup_details (for delivery orders; shown on track-order page).
    const mergedPickup =
      trackingNumber != null || trackingUrl != null
        ? { ...pickupDetails, ...(trackingNumber != null && { trackingNumber: String(trackingNumber) }), ...(trackingUrl != null && { trackingUrl: String(trackingUrl) }) }
        : pickupDetails

    // Update the order status (and pickup_details when tracking provided) and fetch the updated row.
    const updatedOrder = await query(
      `UPDATE orders
       SET status = $1, pickup_details = $2::jsonb, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING
         id,
         order_number,
         square_order_id,
         status,
         total_cents,
         updated_at,
         pickup_details`,
      [normalizedStatus, JSON.stringify(mergedPickup), dbOrderId],
    )

    const updatedPickup =
      updatedOrder.rows[0]?.pickup_details && typeof updatedOrder.rows[0].pickup_details === 'string'
        ? (() => { try { return JSON.parse(updatedOrder.rows[0].pickup_details) } catch { return {} } })()
        : (updatedOrder.rows[0]?.pickup_details || {})

    const itemsFromPickup = Array.isArray(updatedPickup?.items) ? updatedPickup.items : []

    // Send email notification if status changed and customer email exists
    console.log(`[Orders Update API] Checking email conditions:`, {
      previousStatus,
      newStatus: normalizedStatus,
      rawStatus,
      normalizeReason,
      statusChanged: previousStatus !== normalizedStatus,
      customerEmail: customerEmail ? 'exists' : 'missing',
      orderNumber: order.order_number,
    })
    
    let emailAttempted = false
    let emailSent = false
    let emailSkipReason = null
    let reviewEmailAttempted = false
    let reviewEmailSent = false
    let reviewEmailSkipReason = null
    let refundEmailAttempted = false
    let refundEmailSent = false
    let refundEmailSkipReason = null

    if (!forceEmail && previousStatus === normalizedStatus) {
      emailSkipReason = 'status_unchanged'
    } else if (!customerEmail) {
      emailSkipReason = 'missing_customer_email'
    } else if (!process.env.MAKE_EMAIL_WEBHOOK_URL) {
      emailSkipReason = 'missing_MAKE_EMAIL_WEBHOOK_URL'
    }

    if (!emailSkipReason) {
      let ownedStatusKey = null
      try {
        const { sendEmail } = await import('../sendEmail.js')
        const total = order.total_cents ? (Number(order.total_cents) / 100).toFixed(2) : '0.00'
        const statusDedupeKey = `order_status_update:${order.order_number}:${normalizedStatus}`
        const claim = await claimEmailSend({
          dedupeKey: statusDedupeKey,
          emailType: 'order_status_update',
          replace: resendEmail,
        })
        ownedStatusKey = claim.claimed && claim.reason !== 'dedupe_unavailable' ? statusDedupeKey : null
        if (!claim.claimed) {
          emailSkipReason = 'deduped'
          console.log(`[Orders Update API] Skipping duplicate status email for ${order.order_number} (${normalizedStatus})`)
        } else {
          console.log(`[Orders Update API] Sending status update email to ${customerEmail} for order ${order.order_number}`)

          const subject = getOrderStatusUpdateSubject(normalizedStatus, order.order_number)
          const sendResult = await sendEmail({
            type: 'order_status_update',
            to: customerEmail,
            subject,
            data: {
              orderNumber: order.order_number,
              customerName,
              customerEmail,
              status: normalizedStatus,
              previousStatus: previousStatus,
              items: itemsFromPickup.map((item) => ({
                name: item?.name || '',
                quantity: Number(item?.quantity) || 0,
                price: Number(item?.price) || 0,
              })),
              total: total,
              currency: 'USD',
              deliveryMethod: updatedPickup?.deliveryMethod || order?.delivery_method || 'pickup',
              pickupLocation:
                (updatedPickup?.deliveryMethod || order?.delivery_method) === 'delivery'
                  ? [updatedPickup?.address, updatedPickup?.city, updatedPickup?.state, updatedPickup?.zipCode]
                      .filter(Boolean)
                      .join(', ')
                  : (updatedPickup?.address || '215B Main Street, Milford, OH 45150'),
              trackingNumber: updatedPickup?.trackingNumber || null,
              trackingUrl: updatedPickup?.trackingUrl || null,
              estimatedDelivery: updatedPickup?.estimatedDelivery || null,
            },
            dedupeKey: statusDedupeKey,
            // forceEmail must not skip dedupe. Only an explicit resend does.
            force: resendEmail,
          })
          emailAttempted = Boolean(sendResult?.attempted)
          emailSent = Boolean(sendResult?.ok)
          if (!sendResult?.ok && sendResult?.reason !== 'deduped') {
            if (ownedStatusKey) await releaseEmailSend(ownedStatusKey)
            ownedStatusKey = null
            emailSkipReason = sendResult?.reason || 'send_failed'
          } else if (!sendResult?.ok) {
            emailSkipReason = sendResult?.reason || 'deduped'
          }
          console.log(`[Orders Update API] Status update email result for order ${order.order_number}`, sendResult)
        }
      } catch (emailError) {
        console.error('[Orders Update API] Failed to send status update email:', emailError)
        console.error('[Orders Update API] Error details:', emailError.stack)
        emailSent = false
        emailSkipReason = 'send_failed'
        if (ownedStatusKey) await releaseEmailSend(ownedStatusKey)
        // Don't fail the request if email fails
      }
    } else {
      console.log(`[Orders Update API] Skipping email: ${emailSkipReason}`, {
        previousStatus,
        status: normalizedStatus,
        customerEmail: customerEmail ? 'exists' : 'missing',
        hasWebhook: Boolean(process.env.MAKE_EMAIL_WEBHOOK_URL),
      })
    }

    // Separate review request email when picked up / completed (transition only, unless forced).
    // This runs independently of the status-update email (so dedupe/skip on the status email won't block reviews).
    let ownedReviewKey = null
    try {
      const { sendEmail } = await import('../sendEmail.js')
      const noReviewStatuses = new Set(['CANCELED', 'CANCELLED', 'REFUNDED'])
      const isNoReviewStatus = noReviewStatuses.has(nextUpper)

      if (!customerEmail) {
        reviewEmailSkipReason = 'missing_customer_email'
      } else if (!process.env.MAKE_EMAIL_WEBHOOK_URL) {
        reviewEmailSkipReason = 'missing_MAKE_EMAIL_WEBHOOK_URL'
      } else if (isNoReviewStatus) {
        reviewEmailSkipReason = 'status_excluded'
      } else if (!isComplete) {
        reviewEmailSkipReason = 'not_completed_status'
      } else if (!forceEmail && wasComplete) {
        // Only send on transition into completed state unless forced.
        reviewEmailSkipReason = 'already_completed'
      }

      if (!reviewEmailSkipReason) {
        const reviewDedupeKey = `review_request:${order.order_number}`
        const reviewClaim = await claimEmailSend({
          dedupeKey: reviewDedupeKey,
          emailType: 'review_request',
          replace: resendEmail,
        })
        ownedReviewKey = reviewClaim.claimed && reviewClaim.reason !== 'dedupe_unavailable' ? reviewDedupeKey : null
        if (!reviewClaim.claimed) {
          reviewEmailSkipReason = 'deduped'
          console.log(`[Orders Update API] Skipping duplicate review email for ${order.order_number}`)
        } else {
          const reviewResult = await sendEmail({
            type: 'review_request',
            to: customerEmail,
            subject: 'How was your visit? Leave a quick review',
            data: {
              orderNumber: order.order_number,
              customerName,
            },
            dedupeKey: reviewDedupeKey,
            force: resendEmail,
          })
          reviewEmailAttempted = Boolean(reviewResult?.attempted)
          reviewEmailSent = Boolean(reviewResult?.ok)
          if (!reviewResult?.ok && reviewResult?.reason !== 'deduped') {
            if (ownedReviewKey) await releaseEmailSend(ownedReviewKey)
            ownedReviewKey = null
            reviewEmailSkipReason = reviewResult?.reason || 'send_failed'
          } else if (!reviewResult?.ok) {
            reviewEmailSkipReason = reviewResult?.reason || 'deduped'
          }
          console.log(`[Orders Update API] Review request email result for order ${order.order_number}`, reviewResult)
        }
      } else {
        console.log(`[Orders Update API] Skipping review email: ${reviewEmailSkipReason}`, {
          previousStatus,
          status: normalizedStatus,
          customerEmail: customerEmail ? 'exists' : 'missing',
          forceEmail: Boolean(forceEmail),
        })
      }
    } catch (reviewErr) {
      console.error('[Orders Update API] Failed to send review request email:', reviewErr)
      reviewEmailAttempted = true
      reviewEmailSent = false
      reviewEmailSkipReason = 'send_failed'
      if (ownedReviewKey) await releaseEmailSend(ownedReviewKey)
    }

    // Separate refund email when order is canceled (transition only, unless forced).
    let ownedRefundKey = null
    try {
      const { sendEmail } = await import('../sendEmail.js')
      const canceledStatuses = new Set(['CANCELED', 'CANCELLED'])
      const wasCanceled = canceledStatuses.has(prevUpper)
      const isCanceled = canceledStatuses.has(nextUpper)

      if (!customerEmail) {
        refundEmailSkipReason = 'missing_customer_email'
      } else if (!process.env.MAKE_EMAIL_WEBHOOK_URL) {
        refundEmailSkipReason = 'missing_MAKE_EMAIL_WEBHOOK_URL'
      } else if (!isCanceled) {
        refundEmailSkipReason = 'not_canceled_status'
      } else if (!forceEmail && wasCanceled) {
        refundEmailSkipReason = 'already_canceled'
      }

      if (!refundEmailSkipReason) {
        const total = order.total_cents ? (Number(order.total_cents) / 100).toFixed(2) : '0.00'
        const refundDedupeKey = `refund_email:${order.order_number}`
        const refundClaim = await claimEmailSend({
          dedupeKey: refundDedupeKey,
          emailType: 'refund',
          replace: resendEmail,
        })
        ownedRefundKey = refundClaim.claimed && refundClaim.reason !== 'dedupe_unavailable' ? refundDedupeKey : null
        if (!refundClaim.claimed) {
          refundEmailSkipReason = 'deduped'
          console.log(`[Orders Update API] Skipping duplicate refund email for ${order.order_number}`)
        } else {
          const refundResult = await sendEmail({
            type: 'refund',
            to: customerEmail,
            subject: `Refund Processed - Order ${order.order_number}`,
            data: {
              orderNumber: order.order_number,
              customerName,
              total,
              currency: 'USD',
              refundAmount: total,
              refundMethod: 'original payment method',
            },
            dedupeKey: refundDedupeKey,
            force: resendEmail,
          })
          refundEmailAttempted = Boolean(refundResult?.attempted)
          refundEmailSent = Boolean(refundResult?.ok)
          if (!refundResult?.ok && refundResult?.reason !== 'deduped') {
            if (ownedRefundKey) await releaseEmailSend(ownedRefundKey)
            ownedRefundKey = null
            refundEmailSkipReason = refundResult?.reason || 'send_failed'
          } else if (!refundResult?.ok) {
            refundEmailSkipReason = refundResult?.reason || 'deduped'
          }
          console.log(`[Orders Update API] Refund email result for order ${order.order_number}`, refundResult)
        }
      } else {
        console.log(`[Orders Update API] Skipping refund email: ${refundEmailSkipReason}`, {
          previousStatus,
          status: normalizedStatus,
          customerEmail: customerEmail ? 'exists' : 'missing',
          forceEmail: Boolean(forceEmail),
        })
      }
    } catch (refundErr) {
      console.error('[Orders Update API] Failed to send refund email:', refundErr)
      refundEmailAttempted = true
      refundEmailSent = false
      refundEmailSkipReason = 'send_failed'
      if (ownedRefundKey) await releaseEmailSend(ownedRefundKey)
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        order: updatedOrder.rows[0],
        message: `Order status updated to: ${normalizedStatus}`,
        statusNormalization: {
          rawStatus: rawStatus || status,
          normalizedStatus,
          reason: normalizeReason,
        },
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
        },
        refundEmail: {
          attempted: refundEmailAttempted,
          sent: refundEmailSent,
          skipReason: refundEmailSkipReason,
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
