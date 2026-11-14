/**
 * Direct-send versions of Make's "Contact Us" and "Event Inquiries" scenarios.
 * The inbox copy must go out (throws on failure so the form reports an error);
 * the customer's "send me a copy" is best-effort, as it was in Make.
 */
import { sendMail } from './mailer.js'

async function sendInquiry({ to, subject, html, replyTo, copy }) {
  await sendMail('projects', { to, subject, html, replyTo })
  if (copy?.to) {
    try {
      await sendMail('projects', { to: copy.to, subject: copy.subject, html: copy.html })
    } catch (error) {
      console.error('[Inquiry] Customer copy failed:', error?.message || error)
    }
  }
}

export function sendContactInquiryEmails(payload, { html, customerHtml }) {
  const topic = String(payload.topic || '')
  return sendInquiry({
    to: process.env.CONTACT_INQUIRY_TO || 'adam@spiralgrooverecords.com',
    subject: `New Contact Inquiry - ${topic} - ${payload.name || ''}`,
    html,
    replyTo: payload.email,
    copy: payload.sendCopy && payload.email ? { to: payload.email, subject: `${topic || 'Message'} Received`, html: customerHtml } : null,
  })
}

export function sendEventInquiryEmails(payload, { html, customerHtml }) {
  return sendInquiry({
    to: process.env.EVENT_INQUIRY_TO || 'hybridmoments25@gmail.com',
    subject: `Event Inquiry - ${payload.name || ''}`,
    html,
    replyTo: payload.email,
    copy: payload.sendCopy && payload.email ? { to: payload.email, subject: 'Event Inquiry Received', html: customerHtml } : null,
  })
}
