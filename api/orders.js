
import { query } from './db.js'
import { withWebHandler } from './_vercelNodeAdapter.js'

export const config = {
  runtime: 'nodejs',
}

/**
 * GET /api/orders
 * 
 * Fetches orders from Neon database.
 * Requires one of: email, phone, or order_number query param.
 */
export async function webHandler(request) {
  // Only allow GET requests
  if (request.method !== 'GET') {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Method not allowed. Use GET.' 
      }),
      { 
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    const url = new URL(request.url)
    const email = url.searchParams.get('email')
    const phone = url.searchParams.get('phone')
    const orderNumber = url.searchParams.get('order_number')

    // Basic security: Don't allow listing all orders without filter
    if (!email && !phone && !orderNumber) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing filter parameters. Provide email, phone, or order_number.' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    let sql = `
      SELECT 
        o.id,
        o.customer_id,
        o.order_number,
        o.square_order_id,
        o.square_payment_id,
        o.total_cents,
        o.status,
        o.pickup_details,
        o.created_at,
        o.updated_at
      FROM orders o
      WHERE 1=1
    `
    const params = []

    if (email) {
      params.push(email)
      sql += ` AND LOWER(COALESCE(o.pickup_details->>'email','')) = LOWER($${params.length})`
    }
    
    if (phone) {
      params.push(phone)
      sql += ` AND COALESCE(o.pickup_details->>'phone','') = $${params.length}`
    }

    if (orderNumber) {
      params.push(orderNumber)
      sql += ` AND o.order_number = $${params.length}`
    }

    sql += ' ORDER BY o.created_at DESC LIMIT 50'

    const result = await query(sql, params)

    // Normalize response: ensure pickup_details + items are consistently shaped.
    const orders = (result.rows || []).map((row) => {
      const pickup = row.pickup_details && typeof row.pickup_details === 'string'
        ? (() => { try { return JSON.parse(row.pickup_details) } catch { return {} } })()
        : (row.pickup_details || {})

      const items = Array.isArray(pickup?.items) ? pickup.items : []

      return {
        ...row,
        pickup_details: pickup,
        items,
        customer_email: pickup?.email || null,
        customer_phone: pickup?.phone || null,
        customer_name: [pickup?.firstName, pickup?.lastName].filter(Boolean).join(' ') || null,
      }
    })

    return new Response(
      JSON.stringify({ 
        success: true,
        orders
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
    console.error('[Orders API] Failed to fetch orders:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to fetch orders' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

export default withWebHandler(webHandler)

