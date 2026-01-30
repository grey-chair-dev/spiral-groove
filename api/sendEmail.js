/**
 * Unified Email Webhook Handler
 * 
 * Sends all email-related events to a single webhook endpoint.
 * Supports: newsletter signups, order confirmations, signup confirmations, password resets, order status updates
 * 
 * Configure with:
 *   MAKE_EMAIL_WEBHOOK_URL="https://hook.us2.make.com/...."
 */

import {
  generateNewsletterEmail,
  generateSignupEmail,
  generateOrderConfirmationEmail,
  generateForgotPasswordEmail,
  generateOrderStatusUpdateEmail,
} from './emailTemplates.js'

const DEFAULT_DEDUPE_TTL_MS = 5 * 60 * 1000
const dedupeMap = new Map() // key -> ts

function shouldSend(dedupeKey, ttlMs) {
  if (!dedupeKey) return true
  const now = Date.now()
  const last = dedupeMap.get(dedupeKey)
  if (last && now - last < ttlMs) return false
  dedupeMap.set(dedupeKey, now)
  return true
}

/**
 * Send email event to unified webhook
 * 
 * @param {Object} params
 * @param {string} params.type - Email type: 'newsletter', 'order_confirmation', 'signup', 'forgot_password', 'order_status_update'
 * @param {string} params.to - Recipient email address
 * @param {string} [params.subject] - Email subject line
 * @param {Object} [params.data] - Additional data for the email (order details, user info, etc.)
 * @param {string} [params.dedupeKey] - Optional deduplication key
 * @param {number} [params.dedupeTtlMs] - Deduplication TTL in milliseconds
 * @returns {Promise<{ attempted: boolean, ok: boolean, status?: number, statusText?: string, reason?: string }>}
 */
export async function sendEmail({ type, to, subject, data = {}, dedupeKey, dedupeTtlMs = DEFAULT_DEDUPE_TTL_MS, force = false }) {
  try {
    // Get webhook URL
    const webhookUrl = process.env.MAKE_EMAIL_WEBHOOK_URL
    if (!webhookUrl) {
      console.warn('[Email Webhook] No MAKE_EMAIL_WEBHOOK_URL configured')
      return { attempted: false, ok: false, reason: 'missing_MAKE_EMAIL_WEBHOOK_URL' }
    }

    // Deduplication check (skip if force=true)
    if (!force) {
      const key = dedupeKey || `email:${type}:${to}:${Date.now() - (Date.now() % (dedupeTtlMs / 10))}`
      if (!shouldSend(key, dedupeTtlMs)) {
        console.log('[Email Webhook] Skipping duplicate email:', { type, to })
        return { attempted: false, ok: true, reason: 'deduped' }
      }
    }

    // Generate HTML email content based on type
    let html = ''
    try {
      switch (type) {
        case 'newsletter':
          html = generateNewsletterEmail({ ...data, email: to })
          break
        case 'signup':
          html = generateSignupEmail({ ...data, email: to })
          break
        case 'order_confirmation':
          html = generateOrderConfirmationEmail({ ...data, customerEmail: to })
          break
        case 'forgot_password':
          html = generateForgotPasswordEmail({ ...data, email: to })
          break
        case 'order_status_update':
          html = generateOrderStatusUpdateEmail({ ...data, customerEmail: to })
          break
        default:
          console.warn(`[Email Webhook] Unknown email type: ${type}, generating basic HTML`)
          html = `<html><body><h1>${subject || getDefaultSubject(type)}</h1><p>Email type: ${type}</p></body></html>`
      }
    } catch (error) {
      console.error(`[Email Webhook] Error generating HTML for ${type}:`, error)
      html = `<html><body><h1>${subject || getDefaultSubject(type)}</h1><p>Email type: ${type}</p></body></html>`
    }

    // Build email payload with HTML
    const payload = {
      event: `email.${type}`,
      type: type,
      to: to,
      subject: subject || getDefaultSubject(type),
      html: html,
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development',
      ...data,
    }

    // Send to webhook
    if (typeof fetch !== 'function') {
      console.warn('[Email Webhook] fetch() not available; skipping email')
      return { attempted: false, ok: false, reason: 'fetch_unavailable' }
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      console.error('[Email Webhook] Failed to send email:', {
        type,
        to,
        status: response.status,
        statusText: response.statusText,
      })
      return { attempted: true, ok: false, status: response.status, statusText: response.statusText, reason: 'webhook_non_2xx' }
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[Email Webhook] Email sent:', { type, to, status: response.status })
      }
      return { attempted: true, ok: true, status: response.status, statusText: response.statusText }
    }
  } catch (error) {
    console.error('[Email Webhook] Error sending email:', error?.message || error)
    // Don't throw - email failures shouldn't break the main flow
    return { attempted: true, ok: false, reason: 'exception' }
  }
}

/**
 * Get default subject line based on email type
 */
function getDefaultSubject(type) {
  const subjects = {
    newsletter: 'Welcome to Spiral Groove Records Newsletter',
    order_confirmation: 'Order Confirmation - Spiral Groove Records',
    signup: 'Welcome to Spiral Groove Records',
    forgot_password: 'Reset Your Password - Spiral Groove Records',
    order_status_update: 'Order Status Update - Spiral Groove Records',
  }
  return subjects[type] || 'Message from Spiral Groove Records'
}

