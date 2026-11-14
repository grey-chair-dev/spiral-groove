/**
 * Unified transactional email sender (SMTP via api/_lib/mailer.js).
 * Supports: newsletter, order confirmations, signup, password reset, order status, sale alerts, etc.
 */

import {
  generateNewsletterEmail,
  generateSignupEmail,
  generateOrderConfirmationEmail,
  generateForgotPasswordEmail,
  generateOrderStatusUpdateEmail,
  generateOopsApologyEmail,
  generateRefundEmail,
  generateReviewRequestEmail,
  generateWeeklyNewsletterEmail,
  generateAlertEmail,
  generateSaleAlertEmail,
  generateMonthlyReportEmail,
} from './emailTemplates.js'
import { directMailEnabled, sendMail } from './_lib/mailer.js'

// Make's "Transactional Emails" scenario silently dropped mail to this test inbox; kept for parity.
const SUPPRESSED_RECIPIENTS = String(process.env.EMAIL_SUPPRESS_TO ?? 'bcohen0424@gmail.com')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean)

/**
 * Direct send (SGR_SMTP_URL set). Mirrors the Make scenarios it replaces:
 * - sale_alert + transactional → noreply@spiralgrooverecords.com (sgr account)
 */
async function sendDirect({ type, to, subject, html, replyTo }) {
  try {
    if (type !== 'sale_alert' && SUPPRESSED_RECIPIENTS.includes(String(to || '').trim().toLowerCase())) {
      return { attempted: false, ok: true, reason: 'suppressed_recipient' }
    }
    await sendMail('sgr', { to, subject, html, replyTo })
    return { attempted: true, ok: true, status: 200, statusText: 'sent' }
  } catch (error) {
    console.error('[Email] Direct send failed:', { type, to, error: error?.message || error })
    return { attempted: true, ok: false, reason: 'smtp_error', statusText: error?.message }
  }
}

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
 * Send a transactional email over SMTP.
 *
 * @param {Object} params
 * @param {string} params.type - Email type: 'newsletter', 'order_confirmation', 'signup', 'forgot_password', 'order_status_update'
 * @param {string} params.to - Recipient email address
 * @param {string} [params.subject] - Email subject line
 * @param {string} [params.from] - Optional From address (e.g. for internal reports)
 * @param {Object} [params.data] - Additional data for the email (order details, user info, etc.)
 * @param {string} [params.dedupeKey] - Optional deduplication key
 * @param {number} [params.dedupeTtlMs] - Deduplication TTL in milliseconds
 * @returns {Promise<{ attempted: boolean, ok: boolean, status?: number, statusText?: string, reason?: string }>}
 */
export async function sendEmail({ type, to, subject, from: fromParam, data = {}, dedupeKey, dedupeTtlMs = DEFAULT_DEDUPE_TTL_MS, force = false }) {
  try {
    if (!directMailEnabled()) {
      console.warn('[Email] Missing SGR_SMTP_URL for email send', { type })
      return { attempted: false, ok: false, reason: 'missing_smtp' }
    }

    // Deduplication check (skip if force=true)
    if (!force) {
      const key = dedupeKey || `email:${type}:${to}:${Date.now() - (Date.now() % (dedupeTtlMs / 10))}`
      if (!shouldSend(key, dedupeTtlMs)) {
        console.log('[Email] Skipping duplicate email:', { type, to })
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
        case 'order_status_oops':
          html = generateOopsApologyEmail({ ...data, customerEmail: to })
          break
        case 'review_request':
          html = generateReviewRequestEmail({ ...data, customerEmail: to })
          break
        case 'refund':
          html = generateRefundEmail({ ...data, customerEmail: to })
          break
        case 'weekly_newsletter':
          html = generateWeeklyNewsletterEmail({ ...data, email: to })
          break
        case 'alert':
          // If html is already provided in data, use it (for batch alerts), otherwise generate
          html = data.html || generateAlertEmail(data)
          break
        case 'sale_alert':
          html = generateSaleAlertEmail({ ...data })
          break
        case 'monthly_report': {
          const { subject: reportSubject, html: reportHtml } = generateMonthlyReportEmail(data)
          html = reportHtml
          if (reportSubject) subject = reportSubject
          break
        }
        default:
          console.warn(`[Email] Unknown email type: ${type}, generating basic HTML`)
          html = `<html><body><h1>${subject || getDefaultSubject(type)}</h1><p>Email type: ${type}</p></body></html>`
      }
    } catch (error) {
      console.error(`[Email] Error generating HTML for ${type}:`, error)
      html = `<html><body><h1>${subject || getDefaultSubject(type)}</h1><p>Email type: ${type}</p></body></html>`
    }

    // From address: explicit param, or for monthly_report use internal sender
    const fromAddress =
      fromParam ??
      (type === 'monthly_report' ? (process.env.MONTHLY_REPORT_FROM || 'projects@greychair.io') : undefined)

    // Build email payload with HTML
    const payload = {
      event: `email.${type}`,
      type: type,
      to: to,
      subject: subject || getDefaultSubject(type),
      html: html,
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development',
      ...(fromAddress ? { from: fromAddress } : {}),
      ...data,
    }

    return await sendDirect({ type, to, subject: payload.subject, html, replyTo: data?.email })
  } catch (error) {
    console.error('[Email] Error sending email:', error?.message || error)
    return { attempted: true, ok: false, reason: 'exception' }
  }
}

/**
 * Get default subject line based on email type
 */
function getDefaultSubject(type) {
  const subjects = {
    newsletter: 'Welcome to Spiral Groove Records Newsletter',
    weekly_newsletter: 'This Week at Spiral Groove Records',
    order_confirmation: 'Order Confirmation - Spiral Groove Records',
    signup: 'Welcome to Spiral Groove Records',
    forgot_password: 'Reset Your Password - Spiral Groove Records',
    order_status_update: 'Order Status Update - Spiral Groove Records',
    order_status_oops: 'Sorry about that email — Spiral Groove Records',
    review_request: 'How was your visit? Leave a quick review',
    refund: 'Refund Processed - Spiral Groove Records',
    alert: 'API Error Alert - Spiral Groove Records',
    sale_alert: 'New order - Spiral Groove Records',
    monthly_report: 'Monthly report - Spiral Groove Records',
  }
  return subjects[type] || 'Message from Spiral Groove Records'
}

