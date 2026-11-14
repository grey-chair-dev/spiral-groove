/**
 * Direct-send versions of Make's "Contact Us" and "Event Inquiries" scenarios.
 * The inbox copy must go out (throws on failure so the form reports an error);
 * the customer's "send me a copy" is best-effort, as it was in Make.
 */
import { sendMail } from './mailer.js'

async function sendInquiry({ to, subject, html, customerReplyTo, copy }) {
  // Brand as noreply@spiralgrooverecords.com (same Resend domain as order mail).
  // Store/venue notify: Reply-To = customer (Adam hits Reply → emails them).
  // Customer copy: Reply-To = store/venue inbox (not noreply).
  await sendMail('sgr', { to, subject, html, replyTo: customerReplyTo })
  if (copy?.to) {
    try {
      await sendMail('sgr', {
        to: copy.to,
        subject: copy.subject,
        html: copy.html,
        replyTo: to,
      })
    } catch (error) {
      console.error('[Inquiry] Customer copy failed:', error?.message || error)
    }
  }
}

export function sendContactInquiryEmails(payload, { html, customerHtml }) {
  const topic = String(payload.topic || '')
  const storeTo = process.env.CONTACT_INQUIRY_TO || 'adam@spiralgrooverecords.com'
  return sendInquiry({
    to: storeTo,
    subject: `New Contact Inquiry - ${topic} - ${payload.name || ''}`,
    html,
    customerReplyTo: payload.email,
    copy: payload.sendCopy && payload.email ? { to: payload.email, subject: `${topic || 'Message'} Received`, html: customerHtml } : null,
  })
}

export function sendEventInquiryEmails(payload, { html, customerHtml }) {
  const venueTo = process.env.EVENT_INQUIRY_TO || 'hybridmoments25@gmail.com'
  return sendInquiry({
    to: venueTo,
    subject: `Event Inquiry - ${payload.name || ''}`,
    html,
    customerReplyTo: payload.email,
    copy: payload.sendCopy && payload.email ? { to: payload.email, subject: 'Event Inquiry Received', html: customerHtml } : null,
  })
}
