/**
 * Weekly Newsletter Bulk Sender
 * 
 * Vercel Cron endpoint that sends weekly newsletter to all subscribers in email_list
 * Runs every Monday at 9:00 AM UTC
 * 
 * This endpoint is called by Vercel cron and sends to all subscribers automatically
 */

import { withWebHandler } from './_vercelNodeAdapter.js'
import { query } from './db.js'
import { sendEmail } from './sendEmail.js'
import { generateWeeklyNewsletterData } from './weekly-newsletter.js'

export const config = {
  runtime: 'nodejs',
}

/**
 * Get all active newsletter subscribers from email_list
 */
async function getNewsletterSubscribers() {
  try {
    // Try snake_case first (most common)
    let result
    try {
      result = await query(`
        SELECT 
          email, 
          first_name, 
          last_name,
          subscribed
        FROM email_list
        WHERE subscribed = TRUE
          AND email IS NOT NULL
          AND email != ''
        ORDER BY created_at DESC
      `)
    } catch (e) {
      // Fallback: try camelCase column names
      result = await query(`
        SELECT 
          email, 
          "firstName" as first_name, 
          "lastName" as last_name,
          subscribed
        FROM email_list
        WHERE subscribed = TRUE
          AND email IS NOT NULL
          AND email != ''
        ORDER BY "createdAt" DESC
      `)
    }
    
    return result.rows
      .filter(row => row.email && row.subscribed !== false)
      .map(row => ({
        email: row.email.toLowerCase().trim(),
        firstName: row.first_name || null,
        lastName: row.last_name || null,
      }))
  } catch (error) {
    console.error('[Weekly Newsletter Bulk] Error fetching subscribers:', error)
    return []
  }
}

export async function webHandler(request) {
  const method = (request.method || 'GET').toUpperCase()
  
  // Verify this is a Vercel cron request
  const userAgent = request.headers.get('user-agent') || ''
  const xVercelCron = request.headers.get('x-vercel-cron')
  const isVercelCron = Boolean(xVercelCron) || /vercel[-\s]?cron/i.test(userAgent)
  
  if (method === 'GET') {
    if (process.env.NODE_ENV === 'production' && !isVercelCron) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized. This endpoint is for Vercel cron only.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }
  } else if (method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed. Use GET (for cron) or POST.' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Check if we're past the start date (February 15, 2026)
  const START_DATE = new Date('2026-02-15T00:00:00Z')
  const now = new Date()
  
  if (now < START_DATE) {
    const daysUntilStart = Math.ceil((START_DATE - now) / (1000 * 60 * 60 * 24))
    const message = `Weekly newsletter will start on February 15, 2026 (${daysUntilStart} days from now)`
    console.log(`[Weekly Newsletter Bulk] ${message}`)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message,
        startDate: START_DATE.toISOString(),
        daysUntilStart
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const startedAt = Date.now()
  let syncLogId = null
  
  try {
    // Log sync start
    try {
      const logResult = await query(`
        INSERT INTO sync_log (sync_type, status, started_at, metadata)
        VALUES ('weekly_newsletter', 'running', NOW(), $1::jsonb)
        RETURNING id
      `, [JSON.stringify({ 
        method, 
        isVercelCron,
        userAgent: userAgent.substring(0, 100)
      })])
      syncLogId = logResult.rows[0]?.id
    } catch (logError) {
      console.warn('[Weekly Newsletter Bulk] Failed to log start:', logError.message)
    }

    console.log('[Weekly Newsletter Bulk] Starting weekly newsletter send...')
    
    const subscribers = await getNewsletterSubscribers()
    console.log(`[Weekly Newsletter Bulk] Found ${subscribers.length} subscribers`)
    
    if (subscribers.length === 0) {
      const message = 'No subscribers found'
      console.log(`[Weekly Newsletter Bulk] ${message}`)
      
      // Log completion
      if (syncLogId) {
        try {
          await query(`
            UPDATE sync_log 
            SET status = 'success',
                completed_at = NOW(),
                duration_ms = $1,
                items_processed = 0,
                metadata = COALESCE(metadata, '{}'::jsonb) || $2::jsonb
            WHERE id = $3
          `, [Date.now() - startedAt, JSON.stringify({ message }), syncLogId])
        } catch (e) {}
      }
      
      // Send notification to Slack
      try {
        const { sendSlackAlert } = await import('./slackAlerts.js')
        await sendSlackAlert({
          statusCode: 200,
          endpoint: '/api/weekly-newsletter-bulk',
          method: 'GET',
          context: {
            newsletterSend: true,
            noSubscribers: true,
          },
          error: 'Weekly newsletter: No subscribers found in email_list',
          dedupeKey: `weekly_newsletter_no_subscribers:${new Date().toISOString().split('T')[0]}`,
          dedupeTtlMs: 24 * 60 * 60 * 1000,
        })
      } catch (slackError) {
        console.warn('[Weekly Newsletter Bulk] Failed to send Slack alert:', slackError.message)
      }
      
      return new Response(
        JSON.stringify({ success: true, message, subscribers: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    let successCount = 0
    let errorCount = 0
    const errors = []
    const today = new Date().toISOString().split('T')[0]
    
    for (const subscriber of subscribers) {
      try {
        // Generate personalized newsletter data
        const newsletterData = await generateWeeklyNewsletterData(
          subscriber.email,
          subscriber.firstName,
          subscriber.lastName
        )
        
        // Send email
        const result = await sendEmail({
          type: 'weekly_newsletter',
          to: subscriber.email,
          data: newsletterData,
          dedupeKey: `weekly_newsletter:${subscriber.email}:${today}`,
          dedupeTtlMs: 24 * 60 * 60 * 1000, // 24 hours - one email per day max
        })
        
        if (result.ok) {
          successCount++
          if (successCount % 10 === 0) {
            console.log(`[Weekly Newsletter Bulk] Sent to ${successCount}/${subscribers.length} subscribers...`)
          }
        } else {
          errorCount++
          const errorMsg = `Failed to send to ${subscriber.email}: ${result.reason}`
          errors.push(errorMsg)
          console.error(`[Weekly Newsletter Bulk] ✗ ${errorMsg}`)
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        errorCount++
        const errorMsg = `Error sending to ${subscriber.email}: ${error.message}`
        errors.push(errorMsg)
        console.error(`[Weekly Newsletter Bulk] ✗ ${errorMsg}`)
      }
    }
    
    const durationMs = Date.now() - startedAt
    
    // Log sync completion
    if (syncLogId) {
      try {
        await query(`
          UPDATE sync_log 
          SET status = ${errorCount === 0 ? "'success'" : "'error'"},
              completed_at = NOW(),
              duration_ms = $1,
              items_processed = $2,
              items_created = $3,
              error_message = ${errors.length > 0 ? '$4' : 'NULL'},
              metadata = COALESCE(metadata, '{}'::jsonb) || $5::jsonb
          WHERE id = $6
        `, [
          durationMs,
          subscribers.length,
          successCount,
          errors.length > 0 ? errors.slice(0, 5).join('; ') : null,
          JSON.stringify({ 
            successCount,
            errorCount,
            totalSubscribers: subscribers.length
          }),
          syncLogId
        ])
      } catch (logError) {
        console.warn('[Weekly Newsletter Bulk] Failed to log completion:', logError.message)
      }
    }
    
    console.log('\n[Weekly Newsletter Bulk] Summary:')
    console.log(`  ✓ Success: ${successCount}`)
    console.log(`  ✗ Errors: ${errorCount}`)
    console.log(`  ⏱️  Duration: ${Math.round(durationMs / 1000)}s`)
    
    // Send summary to Slack
    try {
      const { sendSlackAlert } = await import('./slackAlerts.js')
      const durationSeconds = Math.round(durationMs / 1000)
      const successRate = subscribers.length > 0 
        ? Math.round((successCount / subscribers.length) * 100) 
        : 0
      
      await sendSlackAlert({
        statusCode: errorCount === 0 ? 200 : 207, // 207 = Multi-Status (partial success)
        endpoint: '/api/weekly-newsletter-bulk',
        method: 'GET',
        context: {
          newsletterSend: true,
          totalSubscribers: subscribers.length,
          successCount,
          errorCount,
          successRate: `${successRate}%`,
          durationSeconds,
          durationMs,
        },
        error: errorCount > 0 
          ? `Weekly newsletter sent with ${errorCount} errors`
          : `Weekly newsletter sent successfully to ${successCount} subscribers`,
        dedupeKey: `weekly_newsletter:${new Date().toISOString().split('T')[0]}`,
        dedupeTtlMs: 24 * 60 * 60 * 1000, // 24 hours
        metadata: {
          summary: {
            totalSubscribers: subscribers.length,
            successCount,
            errorCount,
            durationSeconds,
            durationMs,
            successRate: `${successRate}%`,
          },
          errors: errors.length > 0 ? errors.slice(0, 5) : undefined, // First 5 errors
        },
      })
    } catch (slackError) {
      console.warn('[Weekly Newsletter Bulk] Failed to send Slack alert:', slackError.message)
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Weekly newsletter sent',
        summary: {
          totalSubscribers: subscribers.length,
          successCount,
          errorCount,
          durationMs,
        },
        errors: errors.length > 0 ? errors.slice(0, 10) : undefined, // Limit errors in response
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const durationMs = Date.now() - startedAt
    const errorMessage = error?.message || 'Weekly newsletter send failed'
    
    // Log error
    if (syncLogId) {
      try {
        await query(`
          UPDATE sync_log 
          SET status = 'error',
              completed_at = NOW(),
              duration_ms = $1,
              error_message = $2
          WHERE id = $3
        `, [durationMs, errorMessage.substring(0, 1000), syncLogId])
      } catch (logError) {
        console.warn('[Weekly Newsletter Bulk] Failed to log error:', logError.message)
      }
    }
    
    console.error('[Weekly Newsletter Bulk] Fatal error:', error)
    
    // Send error alert to Slack
    try {
      const { sendSlackAlert } = await import('./slackAlerts.js')
      await sendSlackAlert({
        statusCode: 500,
        endpoint: '/api/weekly-newsletter-bulk',
        method: 'GET',
        error: errorMessage,
        context: {
          newsletterSend: true,
          fatalError: true,
        },
        stack: error?.stack,
        dedupeKey: `weekly_newsletter_error:${new Date().toISOString().split('T')[0]}`,
        dedupeTtlMs: 24 * 60 * 60 * 1000,
      })
    } catch (slackError) {
      console.warn('[Weekly Newsletter Bulk] Failed to send Slack error alert:', slackError.message)
    }
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export default withWebHandler(webHandler)
