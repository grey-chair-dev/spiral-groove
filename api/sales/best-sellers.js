import { withWebHandler } from '../_vercelNodeAdapter.js'
import { query } from '../db.js'

export const config = {
  runtime: 'nodejs',
}

/**
 * GET /api/sales/best-sellers?days=30&limit=50
 *
 * Uses sales_line_items (Square backfill + daily sync) to compute best sellers.
 * Quantities come from Square line item quantities (rounded down to int in ingest).
 */
export async function webHandler(request) {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed. Use GET.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Sales analytics shouldn’t be public by default.
  // Protect with WEBHOOK_SECRET in production (optional).
  const webhookSecret = request.headers.get('x-webhook-secret')
  if (process.env.NODE_ENV === 'production' && process.env.WEBHOOK_SECRET && webhookSecret !== process.env.WEBHOOK_SECRET) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const url = new URL(request.url)
    const daysRaw = url.searchParams.get('days')
    const limitRaw = url.searchParams.get('limit')

    const days = daysRaw != null ? Math.max(1, Math.min(3650, Number(daysRaw))) : 30
    const limit = limitRaw != null ? Math.max(1, Math.min(500, Number(limitRaw))) : 50

    const res = await query(
      `
      SELECT
        pc.id AS product_id,
        pc.name AS product_name,
        pc.category,
        pc.image_url,
        SUM(sli.quantity)::bigint AS qty_sold,
        MAX(sli.order_created_at) AS last_sold_at
      FROM sales_line_items sli
      JOIN products_cache pc
        ON pc.id = ('variation-' || sli.square_catalog_object_id)
      WHERE sli.order_created_at >= (NOW() - ($1::int * INTERVAL '1 day'))
        AND COALESCE(pc.name, '') !~ '^\\s*1\\s*-\\s*' -- filter Square POS generic items
      GROUP BY pc.id, pc.name, pc.category, pc.image_url
      ORDER BY qty_sold DESC, last_sold_at DESC
      LIMIT $2::int
      `,
      [days, limit],
    )

    return new Response(JSON.stringify({ success: true, days, limit, rows: res.rows }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  } catch (e) {
    const msg = e?.message || 'Failed to query best sellers'
    const notSynced =
      /sales_line_items/i.test(msg) && /does not exist/i.test(msg)
    return new Response(JSON.stringify({
      success: false,
      error: notSynced ? 'Sales have not been synced yet.' : msg,
      message: notSynced ? 'Run /api/square/sales-sync (or npm run sync:sales) to backfill sales history.' : undefined,
    }), {
      status: notSynced ? 409 : 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }
}

export default withWebHandler(webHandler)

