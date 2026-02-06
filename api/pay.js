/**
 * POST /api/pay
 * 
 * Secure payment capture endpoint for Square Payments
 * 
 * This endpoint:
 * - Receives Square payment nonce (token) and cart items from frontend
 * - Creates an Order in Square to track inventory and items
 * - Creates a Payment linked to that Order
 * - Returns success/failure to frontend
 * 
 * Security:
 * - Access Token is NEVER exposed to frontend (server-side only)
 * - PCI compliant - card data never touches our servers
 * - Idempotency keys prevent duplicate charges
 */

import { createRequire } from 'module';
import crypto from 'crypto';
import { query } from './db.js';
import { withWebHandler } from './_vercelNodeAdapter.js'

const require = createRequire(import.meta.url);
const { SquareClient, SquareEnvironment, SquareError } = require('square');
const Client = SquareClient;
const Environment = SquareEnvironment;
const ApiError = SquareError;

// Helper to serialize BigInt in JSON
const jsonReplacer = (key, value) => {
  return typeof value === 'bigint' ? value.toString() : value;
}

// Sold-count analytics previously updated products_cache. Catalog now uses `products` table.
// Keep checkout flow simple: skip sold-count tracking unless reintroduced explicitly.

// Basic in-memory rate limiter (best-effort). Vercel serverless may not preserve state across invocations,
// but it still reduces bursts within a warm instance.
const rateStore = new Map()
function getClientIp(request) {
  const fwd = request?.headers?.get?.('x-forwarded-for') || ''
  if (fwd) return String(fwd).split(',')[0].trim()
  const realIp = request?.headers?.get?.('x-real-ip') || ''
  if (realIp) return String(realIp).trim()
  const cfIp = request?.headers?.get?.('cf-connecting-ip') || ''
  if (cfIp) return String(cfIp).trim()
  return 'unknown'
}
function checkRateLimit(key, { windowMs, max }) {
  const now = Date.now()
  const prev = rateStore.get(key)
  if (!prev || prev.resetAt <= now) {
    rateStore.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: max - 1, resetAt: now + windowMs }
  }
  if (prev.count >= max) return { ok: false, remaining: 0, resetAt: prev.resetAt }
  prev.count += 1
  return { ok: true, remaining: max - prev.count, resetAt: prev.resetAt }
}

async function incrementSoldCounts(_cartItems) {
  // no-op
}

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export async function webHandler(request) {
  const requestId = crypto.randomUUID()
  const userAgent = request.headers.get('user-agent') || ''
  const ip = getClientIp(request)

  // Only allow POST requests
  if (request.method !== 'POST') {
    const { sendSlackAlert } = await import('./slackAlerts.js')
    void sendSlackAlert({
      statusCode: 405,
      error: 'Method not allowed. Use POST.',
      endpoint: '/api/pay',
      method: request.method,
      requestId,
      userAgent,
      ip,
      dedupeKey: `pay:405:${request.method}`,
    })
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
    const startTime = Date.now()
    // Rate limit payment attempts per IP
    const ip = getClientIp(request)
    const rl = checkRateLimit(`pay:${ip}`, { windowMs: 60_000, max: 30 })
    if (!rl.ok) {
      const { sendSlackAlert } = await import('./slackAlerts.js')
      void sendSlackAlert({
        statusCode: 429,
        error: 'Too many requests. Please wait and try again.',
        endpoint: '/api/pay',
        method: 'POST',
        requestId,
        userAgent,
        ip,
        rateLimit: {
          ip,
          limit: 30,
          windowMs: 60000,
          remaining: 0,
          resetTime: rl.resetTime || Date.now() + 60000,
        },
        context: {
          rateLimitExceeded: true,
          endpoint: '/api/pay',
        },
        dedupeKey: `pay:429:${ip}`,
        dedupeTtlMs: 60 * 1000, // 1 minute for rate limit alerts
      })
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Too many requests. Please wait and try again.',
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } },
      )
    }

    // Get Square Access Token from environment (server-side only)
    const accessToken = process.env.SQUARE_ACCESS_TOKEN
    
    if (!accessToken) {
      console.error('[Payment API] Missing SQUARE_ACCESS_TOKEN environment variable')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Payment processing configuration error. Please contact support.' 
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Get Square Location ID
    const locationId = process.env.SQUARE_LOCATION_ID
    
    if (!locationId) {
      console.error('[Payment API] Missing SQUARE_LOCATION_ID environment variable')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Payment processing configuration error. Please contact support.' 
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Determine environment (sandbox or production)
    const squareEnv = (process.env.SQUARE_ENVIRONMENT || (process.env.NODE_ENV === 'production' ? 'production' : 'sandbox')).toLowerCase()
    const environment = squareEnv === 'production' ? Environment.Production : Environment.Sandbox

    // Initialize Square client
    const client = new Client({
      token: accessToken,
      environment: environment,
    })

    // Parse request body
    let requestBody
    try {
      requestBody = await request.json()
    } catch (parseError) {
      console.error('[Payment API] Invalid JSON in request body:', parseError)
      const { sendSlackAlert } = await import('./slackAlerts.js')
      void sendSlackAlert({
        statusCode: 400,
        error: 'Invalid request format.',
        endpoint: '/api/pay',
        method: 'POST',
        requestId,
        userAgent,
        ip,
        context: { parseError: parseError?.message },
        dedupeKey: `pay:400:invalid-json`,
      })
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid request format.' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate required fields
    const { sourceId, idempotencyKey, cartItems, pickupForm } = requestBody

    if (!sourceId) {
      const { sendSlackAlert } = await import('./slackAlerts.js')
      const responseTime = Date.now() - startTime
      void sendSlackAlert({
        statusCode: 400,
        error: 'Missing payment token (sourceId).',
        endpoint: '/api/pay',
        method: 'POST',
        requestId,
        userAgent,
        ip,
        responseTime,
        requestBody: requestBody ? { ...requestBody, sourceId: '[REDACTED]' } : undefined,
        dedupeKey: `pay:400:missing-sourceId`,
      })
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing payment token (sourceId).' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    if (!idempotencyKey) {
      const { sendSlackAlert } = await import('./slackAlerts.js')
      const responseTime = Date.now() - startTime
      void sendSlackAlert({
        statusCode: 400,
        error: 'Missing idempotency key.',
        endpoint: '/api/pay',
        method: 'POST',
        requestId,
        userAgent,
        ip,
        responseTime,
        requestBody: requestBody ? { ...requestBody, idempotencyKey: '[REDACTED]' } : undefined,
        dedupeKey: `pay:400:missing-idempotency`,
      })
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing idempotency key.' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('[Payment API] Processing order and payment:', {
      itemCount: cartItems?.length || 0,
      locationId: locationId,
      environment: squareEnv,
      hasSourceId: !!sourceId,
    })

    // Canonicalize cart items server-side (never trust client prices).
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Your cart is empty.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      )
    }

    const requested = cartItems
      .map((it) => ({
        id: typeof it?.id === 'string' ? it.id : '',
        quantity: Number(it?.quantity || 0),
      }))
      .filter((it) => it.id && Number.isFinite(it.quantity) && it.quantity > 0)

    if (requested.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid cart items.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      )
    }

    const ids = Array.from(new Set(requested.map((x) => x.id)))
    const variationIds = ids
      .map((id) => (String(id).startsWith('variation-') ? String(id).slice('variation-'.length) : String(id)))
      .filter(Boolean)
    const dbRes = await query(
      `SELECT square_variation_id, name, price_cents
       FROM products
       WHERE square_variation_id = ANY($1::text[])`,
      [variationIds],
    )
    const byVariationId = new Map(dbRes.rows.map((r) => [String(r.square_variation_id), r]))
    const missing = variationIds.filter((vid) => !byVariationId.has(vid))
    if (missing.length > 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'One or more items are no longer available.', missing }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      )
    }

    const canonicalCartItems = requested.map((it) => {
      const variationId = String(it.id).startsWith('variation-') ? String(it.id).slice('variation-'.length) : String(it.id)
      const row = byVariationId.get(variationId)
      const priceCents = Number(row?.price_cents || 0)
      return {
        id: it.id,
        name: String(row?.name || ''),
        quantity: Math.min(99, Math.max(1, Math.round(it.quantity))),
        priceCents: Math.max(0, Math.round(priceCents)),
        squareVariationId: variationId || null,
      }
    })

    // 0. Handle Customer FIRST (before creating order, so we can link it)
    const email = pickupForm?.email || ''
    let squareCustomerId = null
    let customerId = null // Neon customer ID
    
    if (email) {
      // 1. Check Neon database first
      const customerRes = await query(
        'SELECT id, square_customer_id FROM customers WHERE email = $1', 
        [email]
      )
      
      if (customerRes.rows.length > 0) {
        customerId = customerRes.rows[0].id
        squareCustomerId = customerRes.rows[0].square_customer_id
        
        // If customer exists in Neon but doesn't have Square ID, try to find/link it
        if (!squareCustomerId) {
          console.log('[Payment API] Customer exists in Neon but no Square ID, searching Square...')
          // Fall through to Square search below
        } else {
          console.log('[Payment API] Found existing customer in Neon:', { customerId, squareCustomerId })
        }
      }
      
      // 2. If no customer in Neon OR customer exists but no Square ID, check Square
      if (!customerId || !squareCustomerId) {
        try {
          const searchResponse = await client.customers.search({
            query: {
              filter: {
                emailAddress: {
                  exact: email
                }
              }
            }
          })
          
          const searchResult = searchResponse.result || searchResponse.data || searchResponse.body || searchResponse
          const squareCustomers = searchResult.customers || []
          
          if (squareCustomers.length > 0) {
            // Found existing Square customer
            squareCustomerId = squareCustomers[0].id
            console.log('[Payment API] Found existing Square customer:', squareCustomerId)
            
            if (customerId) {
              // Update existing Neon customer with Square ID
              await query(
                'UPDATE customers SET square_customer_id = $1, updated_at = NOW() WHERE id = $2',
                [squareCustomerId, customerId]
              )
              console.log('[Payment API] Updated Neon customer with Square customer ID')
            } else {
              // Create new Neon customer record linked to Square customer
              customerId = crypto.randomUUID()
              await query(
                `INSERT INTO customers (id, email, phone, first_name, last_name, square_customer_id, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
                [
                  customerId,
                  email,
                  pickupForm?.phone || '',
                  pickupForm?.firstName || '',
                  pickupForm?.lastName || '',
                  squareCustomerId
                ]
              )
              console.log('[Payment API] Created Neon customer linked to Square customer')
            }
          } else {
            // 3. Create new customer in Square
            console.log('[Payment API] Creating new customer in Square...')
            const createResponse = await client.customers.create({
              givenName: pickupForm?.firstName || '',
              familyName: pickupForm?.lastName || '',
              emailAddress: email,
              phoneNumber: pickupForm?.phone || undefined,
            })
            
            const createResult = createResponse.result || createResponse.data || createResponse.body || createResponse
            const squareCustomer = createResult.customer
            
            if (squareCustomer && squareCustomer.id) {
              squareCustomerId = squareCustomer.id
              console.log('[Payment API] Created new Square customer:', squareCustomerId)
              
              // Create Neon customer record linked to Square customer
              customerId = crypto.randomUUID()
              await query(
                `INSERT INTO customers (id, email, phone, first_name, last_name, square_customer_id, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
                [
                  customerId,
                  email,
                  pickupForm?.phone || '',
                  pickupForm?.firstName || '',
                  pickupForm?.lastName || '',
                  squareCustomerId
                ]
              )
              console.log('[Payment API] Created Neon customer linked to new Square customer')
            } else {
              // Square customer creation failed, create Neon-only customer
              console.warn('[Payment API] Square customer creation failed, creating Neon-only customer')
              customerId = crypto.randomUUID()
              await query(
                `INSERT INTO customers (id, email, phone, first_name, last_name, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
                [
                  customerId,
                  email,
                  pickupForm?.phone || '',
                  pickupForm?.firstName || '',
                  pickupForm?.lastName || ''
                ]
              )
            }
          }
        } catch (squareErr) {
          // Square API error - log but continue with Neon-only customer
          console.error('[Payment API] Error checking/creating Square customer:', squareErr.message)
          console.warn('[Payment API] Creating Neon-only customer (Square sync may happen later)')
          
          customerId = crypto.randomUUID()
          await query(
            `INSERT INTO customers (id, email, phone, first_name, last_name, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
            [
              customerId,
              email,
              pickupForm?.phone || '',
              pickupForm?.firstName || '',
              pickupForm?.lastName || ''
            ]
          )
        }
      }
      
      // Update square_customer_id if we found one but Neon record didn't have it
      if (squareCustomerId && customerId) {
        const updateRes = await query(
          'UPDATE customers SET square_customer_id = $1, updated_at = NOW() WHERE id = $2 AND square_customer_id IS NULL',
          [squareCustomerId, customerId]
        )
        if (updateRes.rowCount > 0) {
          console.log('[Payment API] Updated Neon customer with Square customer ID')
        }
      }
    }

    // 1. Create Order
    let orderId = null
    let amountMoney = null
    let squareOrderForTotals = null
    
    try {
      // Construct canonical Square line items using server-side prices + variation IDs
      const lineItems = canonicalCartItems.map((item) => {
        const lineItem = {
          quantity: String(item.quantity),
          basePriceMoney: {
            amount: BigInt(item.priceCents),
            currency: 'USD',
          },
        }

        if (item.squareVariationId) {
          lineItem.catalogObjectId = item.squareVariationId
        } else {
          // Fallback (should be rare): ad-hoc item, still priced server-side.
          lineItem.name = item.name
        }
        return lineItem
      })

      const orderRequest = {
        idempotencyKey: crypto.randomUUID(),
        order: {
          locationId: locationId,
          lineItems: lineItems,
          // Ensure Square computes taxes/discounts based on catalog + location settings.
          // Without this, Square may not apply configured taxes automatically.
          pricingOptions: {
            autoApplyTaxes: true,
            autoApplyDiscounts: true,
          },
        },
      }

      // Link order to Square customer if we have one
      if (squareCustomerId) {
        orderRequest.order.customerId = squareCustomerId
        console.log('[Payment API] Linking order to Square customer:', squareCustomerId)
      }

      // Add fulfillment info if pickup
      if (pickupForm) {
        orderRequest.order.fulfillments = [{
          type: 'PICKUP',
          state: 'PROPOSED',
          pickupDetails: {
            recipient: {
              displayName: `${pickupForm.firstName} ${pickupForm.lastName}`,
              emailAddress: pickupForm.email,
              phoneNumber: pickupForm.phone,
            },
            scheduleType: 'ASAP',
          },
        }]
      }

      console.log('[Payment API] Creating Square Order...')
      const response = await client.orders.create(orderRequest)
      const orderResult = response.result || response.data || response.body || response

      if (orderResult.order) {
        orderId = orderResult.order.id
        squareOrderForTotals = orderResult.order
        amountMoney = orderResult.order.totalMoney
        console.log('[Payment API] Order created:', {
          orderId,
          total: amountMoney.amount
        })
      }

    } catch (orderError) {
      console.error('[Payment API] Failed to create order:', orderError)
      // If order creation fails, we could abort or try to proceed with simple payment
      // For now, let's abort to ensure data consistency
      throw orderError
    }

    if (!amountMoney) {
       return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Could not determine payment amount from order items.' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // 2. Create Payment
    const paymentRequest = {
      sourceId: sourceId,
      amountMoney: {
        amount: amountMoney.amount, // BigInt from Order
        currency: amountMoney.currency,
      },
      idempotencyKey: idempotencyKey,
      locationId: locationId,
      orderId: orderId, // Link payment to the order we just created
    }

    // Add buyer info for the payment record too
    if (pickupForm) {
      paymentRequest.buyerEmailAddress = pickupForm.email
    }

    console.log('[Payment API] Creating Payment...')
    const response = await client.payments.create(paymentRequest)
    // console.log('[Payment API] Payment Response keys:', Object.keys(response || {}))
    
    const result = response.result || response.data || response.body || response
    const payment = result?.payment || response?.payment

    if (payment) {
      console.log('[Payment API] Payment successful:', {
        paymentId: payment.id,
        orderId: payment.orderId,
        status: payment.status,
      })

      // 3. Save Order to Neon Database (Normalized Schema)
      let orderNumber = null;
      try {
        orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
        const dbOrderId = crypto.randomUUID()
        
        console.log('[Payment API] Saving order to Neon:', orderNumber)
        
        // Note: Customer handling already done above (before Square Order creation)
        // customerId and squareCustomerId are already set

        // B. Create Order in Neon
        // Store pickup/contact info AND purchased items inside pickup_details (JSONB) so order lookup/status
        // can render without depending on other tables/joins.
        const pickupDetailsPayload = {
          ...(pickupForm || {}),
          // Persist Square-calculated totals so receipts/reporting use the actual charged/taxed values.
          totals: {
            totalCents: squareOrderForTotals?.totalMoney?.amount != null ? Number(squareOrderForTotals.totalMoney.amount) : null,
            taxCents: squareOrderForTotals?.totalTaxMoney?.amount != null ? Number(squareOrderForTotals.totalTaxMoney.amount) : null,
            discountCents: squareOrderForTotals?.totalDiscountMoney?.amount != null ? Number(squareOrderForTotals.totalDiscountMoney.amount) : null,
            serviceChargeCents: squareOrderForTotals?.totalServiceChargeMoney?.amount != null ? Number(squareOrderForTotals.totalServiceChargeMoney.amount) : null,
            currency: squareOrderForTotals?.totalMoney?.currency || 'USD',
          },
          items: Array.isArray(canonicalCartItems)
            ? canonicalCartItems.map((it) => ({
                id: it?.id ?? null,
                name: it?.name ?? '',
                quantity: Number(it?.quantity) || 0,
                price: Number((it?.priceCents || 0) / 100) || 0,
              }))
            : [],
        }
        await query(
          `INSERT INTO orders (
            id,
            customer_id,
            order_number, 
            square_order_id, 
            square_payment_id, 
            total_cents, 
            status, 
            pickup_details,
            created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
          [
            dbOrderId,
            customerId,
            orderNumber,
            payment.orderId || orderId,
            payment.id,
            payment.amountMoney?.amount ? Number(payment.amountMoney.amount) : 0,
            'PROPOSED', // New order just came in (canonical initial state)
            JSON.stringify(pickupDetailsPayload)
          ]
        )

        // C. Create Order Items (batched, FK-safe)
        if (Array.isArray(canonicalCartItems) && canonicalCartItems.length > 0) {
          const params = []
          const tuples = []
          let i = 1
          for (const item of canonicalCartItems) {
            // We *attempt* to link product_id -> products_cache(id). If it doesn't exist, we insert NULL.
            params.push(
              crypto.randomUUID(), // item id
              dbOrderId,           // order id
              String(item.id),     // product id candidate
              Number(item.quantity) || 0,
              Math.round(Number(item.priceCents) || 0),
              String(item.name || ''),
            )
            tuples.push(`($${i}::text, $${i + 1}::text, $${i + 2}::text, $${i + 3}::int, $${i + 4}::bigint, $${i + 5}::text)`)
            i += 6
          }

          await query(
            `WITH v(item_id, order_id, product_id, quantity, price_cents, name) AS (
               VALUES ${tuples.join(',')}
             )
             INSERT INTO order_items (id, order_id, product_id, quantity, price_cents, name, created_at)
             SELECT
               v.item_id,
               v.order_id,
               v.product_id,
               v.quantity,
               v.price_cents,
               v.name,
               NOW()
             FROM v`,
            params,
          )
        }

        // D. Update product sold counts for best/worst-seller analytics (best-effort)
        await incrementSoldCounts(canonicalCartItems.map((it) => ({ id: it.id, quantity: it.quantity })))

        console.log('[Payment API] Order saved to Neon successfully')

        // Send order confirmation email
        const email = pickupForm?.email
        if (email) {
          try {
            const { sendEmail } = await import('./sendEmail.js')
            await sendEmail({
              type: 'order_confirmation',
              to: email,
              subject: `Order Confirmation ${orderNumber} - Spiral Groove Records`,
              data: {
                orderNumber: orderNumber,
                orderId: dbOrderId,
                squareOrderId: payment.orderId || orderId,
                squarePaymentId: payment.id,
                total: payment.amountMoney?.amount ? (Number(payment.amountMoney.amount) / 100).toFixed(2) : '0.00',
                currency: payment.amountMoney?.currency || 'USD',
                customerName: `${pickupForm?.firstName || ''} ${pickupForm?.lastName || ''}`.trim(),
                customerEmail: email,
                customerPhone: pickupForm?.phone || null,
                items: cartItems?.map(item => ({
                  name: item.name,
                  quantity: item.quantity,
                  price: Number((item.priceCents || 0) / 100) || 0,
                })) || [],
                deliveryMethod: 'pickup',
                pickupLocation: '215B Main Street, Milford, OH 45150',
              },
              dedupeKey: `order_confirmation:${orderNumber}`,
            })
          } catch (emailError) {
            console.error('[Payment API] Failed to send order confirmation email:', emailError)
            // Don't fail the request if email fails
          }
        }
      } catch (dbError) {
        console.error('[Payment API] Failed to save order to Neon:', dbError)
        // Don't fail the request, just log it. The Square payment succeeded.
      }

      // Return success response with BigInt handling
      return new Response(
        JSON.stringify({
          success: true,
          payment: {
            id: payment.id,
            status: payment.status,
            orderId: payment.orderId,
            receiptUrl: payment.receiptUrl,
            amountMoney: {
              amount: payment.amountMoney?.amount,
              currency: payment.amountMoney?.currency
            },
            // Expose Square-calculated breakdown so frontend confirmation/receipt can show the real tax.
            totals: {
              totalCents: squareOrderForTotals?.totalMoney?.amount != null ? Number(squareOrderForTotals.totalMoney.amount) : null,
              taxCents: squareOrderForTotals?.totalTaxMoney?.amount != null ? Number(squareOrderForTotals.totalTaxMoney.amount) : null,
              currency: squareOrderForTotals?.totalMoney?.currency || payment.amountMoney?.currency || 'USD',
            },
            // Return our generated order number so frontend can use it
            localOrderNumber: orderNumber
          }
        }, jsonReplacer),
        {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        }
      )
    } else {
      console.error('[Payment API] Unexpected response from Square:', response)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Payment processing failed. Please try again.' 
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

  } catch (error) {
    console.error('[Payment API] Error:', error)
    
    const squareCode = error instanceof ApiError ? error.errors?.[0]?.code : undefined
    const squareDetail = error instanceof ApiError ? error.errors?.[0]?.detail : undefined

    // Default user-facing message (safe + actionable)
    let errorMessage = 'Payment failed. Please try another card or try again in a moment.'
    let statusCode = 500

    if (error instanceof ApiError) {
      statusCode = error.statusCode

      // Prefer a friendly message over raw Square detail (which can be terse/technical).
      // Keep detail as a fallback.
      const code = squareCode
      const detail = squareDetail

      const friendlyByCode = (c) => {
        if (!c) return null
        const codeStr = String(c).toUpperCase()
        if (codeStr.includes('CARD_DECLINED')) return 'Your card was declined. Please try another card.'
        if (codeStr.includes('VERIFY_CVV') || codeStr.includes('CVV')) return 'The card security code (CVV) looks incorrect. Please try again.'
        if (codeStr.includes('VERIFY_AVS') || codeStr.includes('AVS')) return 'The billing address could not be verified. Please check and try again.'
        if (codeStr.includes('INSUFFICIENT_FUNDS')) return 'Insufficient funds. Please try another card.'
        if (codeStr.includes('INVALID_CARD') || codeStr.includes('INVALID')) return 'The card details appear invalid. Please check and try again.'
        if (codeStr.includes('EXPIRATION')) return 'The card expiration date looks invalid. Please check and try again.'
        if (codeStr.includes('PAYMENT_METHOD')) return 'This payment method could not be used. Please try another card.'
        return null
      }

      const friendly = friendlyByCode(code)
      if (friendly) {
        errorMessage = friendly
      } else if (detail) {
        errorMessage = detail
      }
      
      console.error('[Payment API] Square API Error:', {
        statusCode,
        code,
        detail,
        errors: error.errors
      })
    }

    // Send Slack alert for payment errors (always critical)
    const { sendSlackAlert } = await import('./slackAlerts.js')
    void sendSlackAlert({
      statusCode,
      error: errorMessage,
      endpoint: '/api/pay',
      method: 'POST',
      context: {
        squareErrorCode: error instanceof ApiError ? error.errors?.[0]?.code : undefined,
        squareErrorDetail: error instanceof ApiError ? error.errors?.[0]?.detail : undefined,
      },
      stack: error?.stack,
      dedupeKey: `pay:${statusCode}:${errorMessage}`,
    })

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development'
          ? {
              message: error?.message,
              squareErrorCode: squareCode,
              squareErrorDetail: squareDetail,
            }
          : undefined
      }, jsonReplacer),
      { 
        status: statusCode,
        headers: { 
          'Content-Type': 'application/json', 
          'Access-Control-Allow-Origin': '*' 
        }
      }
    )
  }
}

export const config = {
  runtime: 'nodejs',
}

export default withWebHandler(webHandler)
