/**
 * Weekly Newsletter Email Generator
 * 
 * Generates and sends weekly newsletter emails with:
 * - Upcoming events for the week
 * - New records (recently added)
 * - Personalized recommendations based on purchase history
 * 
 * Usage:
 *   POST /api/weekly-newsletter
 *   Body: { email: "customer@example.com", firstName?: string, lastName?: string }
 * 
 * Or call generateWeeklyNewsletterData() to get the data structure for a customer
 */

import { query } from './db.js'
import { sendEmail } from './sendEmail.js'
import { withWebHandler } from './_vercelNodeAdapter.js'

/**
 * Get upcoming events for the next 7 days
 */
async function getUpcomingEvents() {
  try {
    const now = new Date()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const nextWeekDate = nextWeek.toISOString().split('T')[0]
    
    // Optimized query: Use date comparison directly, avoid unnecessary casts in WHERE clause
    // Format dates in application code instead of database for better performance
    const result = await query(
      `SELECT
        id,
        event_name,
        artist,
        venue,
        event_date,
        start_time
      FROM events
      WHERE is_event = true
        AND event_date >= CURRENT_DATE
        AND event_date <= $1::date
      ORDER BY event_date ASC, start_time ASC NULLS LAST
      LIMIT 10`,
      [nextWeekDate]
    )
    
    // Format dates in JavaScript instead of SQL for better performance
    return (result.rows || []).map(row => {
      const eventDate = row.event_date
      const startTime = row.start_time
      
      return {
        id: row.id,
        event_name: row.event_name,
        artist: row.artist,
        venue: row.venue,
        date_iso: eventDate ? new Date(eventDate).toISOString().split('T')[0] : null,
        date_label: eventDate ? formatDateLabel(eventDate) : null,
        start_time: startTime ? (typeof startTime === 'string' ? startTime : new Date(startTime).toISOString().split('T')[1]?.split('.')[0]) : null,
        start_time_label: startTime ? formatTimeLabel(startTime) : null,
      }
    })
  } catch (error) {
    console.error('[Weekly Newsletter] Error fetching events:', error)
    return []
  }
}

// Helper functions to format dates in JavaScript (faster than SQL)
function formatDateLabel(date) {
  if (!date) return null
  const d = new Date(date)
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  return `${months[d.getMonth()]} ${d.getDate()}`
}

function formatTimeLabel(time) {
  if (!time) return null
  const d = new Date(time)
  const hours = d.getHours()
  const minutes = d.getMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`
}

/**
 * Get the most recent albums.
 * Keep it simple: just return the 12 most recently created in-stock albums from albums_cache.
 */
async function getNewRecords() {
  try {
    const result = await query(
      `SELECT
        ('variation-' || square_variation_id) AS id,
        name,
        description,
        price_dollars AS price,
        category,
        image_url,
        stock_count,
        created_at
      FROM albums_cache
      WHERE stock_count > 0
      ORDER BY created_at DESC NULLS LAST, id ASC
      LIMIT 12`
    )
    
    return result.rows || []
  } catch (error) {
    console.error('[Weekly Newsletter] Error fetching new records:', error)
    return []
  }
}

/**
 * Get personalized recommendations based on purchase history
 */
async function getRecommendations(customerEmail) {
  if (!customerEmail) return []
  
  try {
    // Get customer's past purchases
    const ordersResult = await query(
      `SELECT pickup_details
      FROM orders
      WHERE LOWER(COALESCE(pickup_details->>'email', '')) = LOWER($1)
        AND status NOT IN ('CANCELLED', 'CANCELED')
      ORDER BY created_at DESC
      LIMIT 10`,
      [customerEmail]
    )
    
    if (!ordersResult.rows || ordersResult.rows.length === 0) {
      // No purchase history - return popular items instead
      return await getPopularRecords()
    }
    
    // Extract product IDs and categories from purchase history
    const purchasedProductIds = new Set()
    const purchasedCategories = new Set()
    
    for (const order of ordersResult.rows) {
      const items = order.pickup_details?.items || []
      for (const item of items) {
        if (item.id) purchasedProductIds.add(item.id)
        // Try to extract category from item name or use a default
        if (item.category) purchasedCategories.add(item.category)
      }
    }
    
    // If we have purchase history, find similar products
    if (purchasedProductIds.size > 0 || purchasedCategories.size > 0) {
      const categoryArray = Array.from(purchasedCategories)
      const productIdArray = Array.from(purchasedProductIds)
      
      // Find products in similar categories, excluding already purchased items
      // Only vinyl records
      const recommendationsResult = await query(
        `SELECT
          ('variation-' || square_variation_id) AS id,
          name,
          description,
          price_dollars AS price,
          category,
          image_url,
          stock_count
        FROM albums_cache
        WHERE stock_count > 0
          AND ('variation-' || square_variation_id) != ALL($1::text[])
          AND (
            category IN ('New Vinyl', 'Used Vinyl', '33New', '33Used', '45', 'LP', '12"', '7"', '10"')
            OR category ILIKE '%vinyl%'
            OR category ILIKE '%LP%'
            OR category ILIKE '%12"%'
            OR category ILIKE '%7"%'
            OR category ILIKE '%10"%'
            OR category ILIKE '%45%'
          )
          ${categoryArray.length > 0 ? `AND (category = ANY($2::text[]) OR category IS NULL)` : ''}
        ORDER BY 
          ${categoryArray.length > 0 ? `CASE WHEN category = ANY($2::text[]) THEN 1 ELSE 2 END,` : ''}
          created_at DESC
        LIMIT 12`,
        categoryArray.length > 0 
          ? [productIdArray, categoryArray]
          : [productIdArray]
      )
      
      return recommendationsResult.rows || []
    }
    
    // Fallback to popular items
    return await getPopularRecords()
  } catch (error) {
    console.error('[Weekly Newsletter] Error fetching recommendations:', error)
    return []
  }
}

/**
 * Get popular records (fallback when no purchase history)
 * Only vinyl records
 */
async function getPopularRecords() {
  try {
    const result = await query(
      `SELECT
        ('variation-' || square_variation_id) AS id,
        name,
        description,
        price_dollars AS price,
        category,
        image_url,
        stock_count
      FROM albums_cache
      WHERE stock_count > 0
        AND (
          category IN ('New Vinyl', 'Used Vinyl', '33New', '33Used', '45', 'LP', '12"', '7"', '10"')
          OR category ILIKE '%vinyl%'
          OR category ILIKE '%LP%'
          OR category ILIKE '%12"%'
          OR category ILIKE '%7"%'
          OR category ILIKE '%10"%'
          OR category ILIKE '%45%'
        )
      ORDER BY created_at DESC NULLS LAST
      LIMIT 12`
    )
    
    return result.rows || []
  } catch (error) {
    console.error('[Weekly Newsletter] Error fetching popular records:', error)
    return []
  }
}

/**
 * Generate weekly newsletter data for a customer
 */
export async function generateWeeklyNewsletterData(customerEmail, firstName, lastName) {
  const [upcomingEvents, newRecords] = await Promise.all([
    getUpcomingEvents(),
    getNewRecords(),
  ])
  // Simplified newsletter: no personalization, just the most recent albums.
  const recommendations = []
  
  return {
    email: customerEmail,
    firstName,
    lastName,
    upcomingEvents,
    newRecords,
    recommendations,
  }
}

/**
 * API endpoint handler
 */
export async function webHandler(request) {
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed. Use POST.' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const body = await request.json()
    const { email, firstName, lastName } = body

    if (!email) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required field: email' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Generate newsletter data
    const newsletterData = await generateWeeklyNewsletterData(email, firstName, lastName)

    // Send email
    const result = await sendEmail({
      type: 'weekly_newsletter',
      to: email,
      data: newsletterData,
      dedupeKey: `weekly_newsletter:${email}:${new Date().toISOString().split('T')[0]}`,
      dedupeTtlMs: 24 * 60 * 60 * 1000, // 24 hours - one email per day max
    })

    if (result.ok) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Weekly newsletter sent',
          data: {
            eventsCount: newsletterData.upcomingEvents.length,
            newRecordsCount: newsletterData.newRecords.length,
            recommendationsCount: newsletterData.recommendations.length,
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to send newsletter',
          reason: result.reason,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error('[Weekly Newsletter] Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || 'Internal server error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export default withWebHandler(webHandler)
