
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
        o.order_number,
        o.square_order_id,
        o.total_cents,
        o.status,
        o.pickup_details,
        o.created_at,
        c.email as customer_email,
        c.phone as customer_phone,
        CONCAT(c.first_name, ' ', c.last_name) as customer_name,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', oi.product_id,
              'name', oi.name,
              'quantity', oi.quantity,
              'price', oi.price_cents / 100.0
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) as items
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE 1=1
    `
    const params = []

    if (email) {
      params.push(email)
      sql += ` AND c.email = $${params.length}`
    }
    
    if (phone) {
      params.push(phone)
      sql += ` AND c.phone = $${params.length}`
    }

    if (orderNumber) {
      params.push(orderNumber)
      sql += ` AND o.order_number = $${params.length}`
    }

    sql += ' GROUP BY o.id, c.id ORDER BY o.created_at DESC LIMIT 50'

    const result = await query(sql, params)

    return new Response(
      JSON.stringify({ 
        success: true,
        orders: result.rows 
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

