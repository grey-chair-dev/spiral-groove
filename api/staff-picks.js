import { query } from './db.js'
import { withWebHandler } from './_vercelNodeAdapter.js'

export const config = {
  runtime: 'nodejs',
}

/**
 * GET /api/staff-picks
 *
 * Reads staff picks metadata from Neon `staff_picks` table.
 * Table schema:
 *   id (serial), square_item_id, square_variation_id, name, quote, created_at
 */
export async function webHandler(request) {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed. Use GET.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const url = new URL(request.url)
    const limitRaw = url.searchParams.get('limit')
    const limit = Math.min(50, Math.max(1, Number(limitRaw || 12) || 12))

    const result = await query(
      `SELECT
         sp.id,
         sp.square_item_id,
         sp.square_variation_id,
         sp.name,
         sp.quote,
         sp.created_at
       FROM staff_picks sp
       -- Only return picks that can be resolved to a product in the current catalog cache.
       -- Prevents "dangling" picks that spam console warnings client-side.
       JOIN albums_cache ac
         ON ac.square_variation_id = sp.square_variation_id
       ORDER BY sp.created_at DESC
       LIMIT $1`,
      [limit],
    )

    return new Response(
      JSON.stringify({
        success: true,
        staffPicks: result.rows,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    )
  } catch (error) {
    console.error('[Staff Picks API] Failed to fetch staff picks:', error)
    return new Response(JSON.stringify({ success: false, error: 'Failed to fetch staff picks' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export default withWebHandler(webHandler)

