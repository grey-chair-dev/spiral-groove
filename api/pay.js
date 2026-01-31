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

let didEnsureProductsCacheSalesColumns = false

async function ensureProductsCacheSalesColumns() {
  if (didEnsureProductsCacheSalesColumns) return
  try {
    // Best-effort, idempotent schema update so we can track best/worst sellers.
    // If you prefer migrations, we can move this into a one-off script.
    await query(`ALTER TABLE products_cache ADD COLUMN IF NOT EXISTS sold_count INTEGER NOT NULL DEFAULT 0`)
    await query(`ALTER TABLE products_cache ADD COLUMN IF NOT EXISTS last_sold_at TIMESTAMPTZ`)
    didEnsureProductsCacheSalesColumns = true
  } catch (e) {
    // Don't fail checkout if schema update is blocked; just skip sold tracking.
    console.warn('[Payment API] Unable to ensure products_cache sales columns:', e?.message || e)
  }
}

async function incrementSoldCounts(cartItems) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) return
  try {
    await ensureProductsCacheSalesColumns()

    // Aggregate quantities per product id
    const qtyById = new Map()
    for (const item of cartItems) {
      const id = item?.id
      const qty = Number(item?.quantity || 0)
      if (!id || !Number.isFinite(qty) || qty <= 0) continue
      qtyById.set(id, (qtyById.get(id) || 0) + qty)
    }
    if (qtyById.size === 0) return

    const params = []
    const tuples = []
    let i = 1
    for (const [id, qty] of qtyById.entries()) {
      params.push(String(id), Number(qty))
      // Cast parameters so Postgres doesn't infer qty as TEXT (which breaks integer arithmetic).
      tuples.push(`($${i}::text, $${i + 1}::int)`)
      i += 2
    }

    await query(
      `UPDATE products_cache pc
       SET sold_count = COALESCE(pc.sold_count, 0) + v.qty,
           last_sold_at = NOW()
       FROM (VALUES ${tuples.join(',')}) AS v(id, qty)
       WHERE pc.id = v.id`,
      params
    )
  } catch (e) {
    // Never block checkout success on analytics.
    console.warn('[Payment API] Unable to increment sold_count:', e?.message || e)
  }
}

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export async function webHandler(request) {
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
    
    try {
      // Construct line items
      const lineItems = (cartItems || []).map(item => {
        // Use provided price to match frontend cart total exactly
        const amountCents = Math.round(item.price * 100)
        
        const lineItem = {
          quantity: String(item.quantity),
          basePriceMoney: {
            amount: BigInt(amountCents),
            currency: 'USD'
          }
        }

        // Use catalog object ID if available (tracks inventory)
        if (item.id && item.id.startsWith('variation-')) {
          lineItem.catalogObjectId = item.id.replace('variation-', '')
        } else {
          // Ad-hoc item
          lineItem.name = item.name
        }

        return lineItem
      })

      // If no items, this might be a test or simple charge. 
      // Fallback to requestBody.amountMoney if present, or error.
      if (lineItems.length === 0 && requestBody.amountMoney) {
        amountMoney = {
          amount: BigInt(requestBody.amountMoney.amount),
          currency: requestBody.amountMoney.currency || 'USD'
        }
      }

      if (lineItems.length > 0) {
        const orderRequest = {
          idempotencyKey: crypto.randomUUID(),
          order: {
            locationId: locationId,
            lineItems: lineItems,
          }
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
                phoneNumber: pickupForm.phone
              },
              scheduleType: 'ASAP'
            }
          }]
        }

        console.log('[Payment API] Creating Square Order...')
        const response = await client.orders.create(orderRequest)
        const orderResult = response.result || response.data || response.body || response
        
        if (orderResult.order) {
          orderId = orderResult.order.id
          amountMoney = orderResult.order.totalMoney
          console.log('[Payment API] Order created:', { 
            orderId, 
            total: amountMoney.amount 
          })
        }
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
          items: Array.isArray(cartItems)
            ? cartItems.map((it) => ({
                id: it?.id ?? null,
                name: it?.name ?? '',
                quantity: Number(it?.quantity) || 0,
                price: Number(it?.price) || 0,
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

        // C. Create Order Items
        if (cartItems && cartItems.length > 0) {
          for (const item of cartItems) {
             const itemId = crypto.randomUUID()
             // Try to link to product if exists
             // Note: cartItems.id should match products_cache.id (e.g. variation-XXX)
             // We can check if product exists first, or rely on loose coupling if we didn't enforce FK (but I enforced FK in reset-db.mjs)
             // Wait, I enforced FK: `product_id TEXT REFERENCES products_cache(id)`
             // If cartItem.id doesn't exist in products_cache, this will fail.
             // But cartItems come from the app which loads from products_cache.
             // So it SHOULD exist.
             
             try {
               await query(
                 `INSERT INTO order_items (id, order_id, product_id, quantity, price_cents, name, created_at)
                  VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
                 [
                   itemId,
                   dbOrderId,
                   item.id, 
                   item.quantity,
                   Math.round(item.price * 100),
                   item.name
                 ]
               )
             } catch (itemErr) {
               console.warn(`[Payment API] Failed to save order item ${item.id} (might not exist in cache):`, itemErr.message)
               // Fallback: save without product_id if strict FK fails?
               // Since FK is enforced, we can't save it with invalid product_id.
               // We could save with NULL product_id if I made it nullable.
               // In reset-db.mjs: `product_id TEXT REFERENCES products_cache(id)` -> implied nullable? YES, by default columns are nullable.
               
               if (itemErr.message.includes('foreign key constraint')) {
                 await query(
                   `INSERT INTO order_items (id, order_id, product_id, quantity, price_cents, name, created_at)
                    VALUES ($1, $2, NULL, $4, $5, $6, NOW())`,
                   [
                     itemId,
                     dbOrderId,
                     item.quantity,
                     Math.round(item.price * 100),
                     item.name
                   ]
                 )
               }
             }
          }
        }

        // D. Update product sold counts for best/worst-seller analytics (best-effort)
        await incrementSoldCounts(cartItems)

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
                  price: item.price,
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
    
    let errorMessage = 'Payment processing failed.'
    let statusCode = 500

    if (error instanceof ApiError) {
      statusCode = error.statusCode
      const detail = error.errors?.[0]?.detail
      const code = error.errors?.[0]?.code
      if (detail) errorMessage = detail
      
      console.error('[Payment API] Square API Error:', {
        statusCode,
        code,
        detail,
        errors: error.errors
      })
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
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
