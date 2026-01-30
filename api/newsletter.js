/**
 * POST /api/newsletter
 * 
 * Newsletter subscription endpoint
 * 
 * Accepts email addresses and optionally stores them in database or sends to webhook.
 * Supports Make.com webhook integration for email marketing platforms.
 */

import { withWebHandler } from './_vercelNodeAdapter.js'
import { notifyWebhook } from './notifyWebhook.js'
import crypto from 'crypto'

async function forwardToNewsletterWebhook(payload) {
  const webhookUrl = process.env.MAKE_NEWSLETTER_SIGNUP_WEBHOOK_URL || process.env.MAKE_NEWSLETTER_WEBHOOK_URL
  if (!webhookUrl) return { attempted: false }
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const text = await res.text().catch(() => '')
  if (!res.ok) {
    return { attempted: true, ok: false, status: res.status, body: (text || '').slice(0, 500) }
  }
  return { attempted: true, ok: true }
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
    // Parse request body
    let requestBody
    try {
      requestBody = await request.json()
    } catch (parseError) {
      console.error('[Newsletter API] Invalid JSON in request body:', parseError)
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
    const { email } = requestBody

    if (!email) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email address is required.' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid email address format.' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('[Newsletter API] Processing subscription:', { email })

    // Check if already subscribed to avoid re-sending welcome / double-counting.
    let existing = null
    try {
      const { query } = await import('./db.js')
      const existingRes = await query(
        'SELECT email, subscribed FROM email_list WHERE email = $1 LIMIT 1',
        [email]
      )
      existing = existingRes?.rows?.[0] || null
      if (existing?.subscribed === true) {
        // Dev-only escape hatch: allow re-sending the welcome email for testing purposes.
        const forceSendWelcome = Boolean(requestBody?.forceSendWelcome || requestBody?.force)
        const allowForce = process.env.NODE_ENV !== 'production' && forceSendWelcome
        if (allowForce) {
          console.log('[Newsletter API] Force-sending welcome email (dev)', { email })
        } else {
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Already subscribed.',
            alreadySubscribed: true,
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type',
            },
          }
        )
        }
      }
    } catch (e) {
      // If DB is unavailable, fall back to insert flow.
      console.warn('[Newsletter API] Could not pre-check existing subscription:', e?.message || e)
    }

    // Forward to Make.com (marketing list / CRM) if configured
    const newsletterPayload = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      source: requestBody.source || 'website',
      email: String(email).trim(),
      firstName: requestBody.firstName || null,
      lastName: requestBody.lastName || null,
      pageUrl: requestBody.pageUrl || '',
      userAgent: requestBody.userAgent || '',
    }
    try {
      const forwarded = await forwardToNewsletterWebhook(newsletterPayload)
      if (forwarded.attempted && forwarded.ok === false) {
        console.error('[Newsletter API] Newsletter webhook error', forwarded)
      }
    } catch (e) {
      console.error('[Newsletter API] Newsletter webhook request failed:', e)
    }

    // Store in database
    try {
      const { query } = await import('./db.js')
      await query(
        `INSERT INTO email_list (email, first_name, last_name, source, subscribed)
         VALUES ($1, $2, $3, $4, TRUE)
         ON CONFLICT (email) 
         DO UPDATE SET 
           first_name = COALESCE(EXCLUDED.first_name, email_list.first_name),
           last_name = COALESCE(EXCLUDED.last_name, email_list.last_name),
           source = COALESCE(EXCLUDED.source, email_list.source),
           subscribed = TRUE,
           updated_at = NOW()`,
        [
          email,
          requestBody.firstName || null,
          requestBody.lastName || null,
          requestBody.source || 'website'
        ]
      )
      console.log('[Newsletter API] Subscription saved to database:', email)
    } catch (dbError) {
      console.error('[Newsletter API] Failed to save subscription to database:', dbError)
      // Continue to send email even if database save fails
    }

    // Send to unified email webhook
    const { sendEmail } = await import('./sendEmail.js')
    await sendEmail({
      type: 'newsletter',
      to: email,
      subject: 'Welcome to Spiral Groove Records Newsletter',
      data: {
        firstName: requestBody.firstName || null,
        lastName: requestBody.lastName || null,
        source: requestBody.source || 'website',
      },
      dedupeKey: `newsletter:${email}`,
    })

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: existing?.subscribed === false ? 'Welcome back! You have been re-subscribed.' : 'Successfully subscribed to newsletter!'
      }),
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

  } catch (error) {
    console.error('[Newsletter API] Error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to process subscription. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { 
        status: 500,
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

