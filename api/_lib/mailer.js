/**
 * Direct email sending (replaces the Make.com email relay scenarios).
 *
 * Accounts:
 *   sgr       "Spiral Groove Records" <noreply@spiralgrooverecords.com>  customer + inquiries + sale alerts
 *   projects  general@greychair.digital                                  optional internal / legacy
 *   alerts    alerts@greychair.digital                                   ops alerts
 *
 * Two Resend keys (typical):
 *   SGR_SMTP_URL         spiralgrooverecords.com (transactional + store notify)
 *   SGR_ALERTS_SMTP_URL  greychair.digital (ops alerts)
 *
 * Callers: api/sendEmail.js, api/_lib/inquiryMail.js, api/slackAlerts.js,
 * api/contact-inquiry.js / event-inquiry.js (via directMailEnabled).
 *
 * Env:
 *   SGR_SMTP_URL / SGR_ALERTS_SMTP_URL / SGR_PROJECTS_SMTP_URL
 *   (also ALERTS_SMTP_URL / PROJECTS_SMTP_URL)
 *   SGR_MAIL_FROM / SGR_PROJECTS_MAIL_FROM / SGR_ALERTS_MAIL_FROM
 *   (also PROJECTS_MAIL_FROM / ALERTS_MAIL_FROM)
 *   MAIL_DRY_RUN=1
 */
import nodemailer from 'nodemailer'

const DEFAULT_FROM = {
  sgr: '"Spiral Groove Records" <noreply@spiralgrooverecords.com>',
  projects: 'general@greychair.digital',
  alerts: '"Spiral Groove Alerts" <alerts@greychair.digital>',
}

const transports = new Map()

function firstEnv(...keys) {
  for (const key of keys) {
    const v = process.env[key]
    if (v) return v
  }
  return undefined
}

function smtpUrl(account) {
  if (account === 'alerts') {
    return firstEnv('SGR_ALERTS_SMTP_URL', 'ALERTS_SMTP_URL', 'SGR_PROJECTS_SMTP_URL', 'PROJECTS_SMTP_URL', 'SGR_SMTP_URL')
  }
  if (account === 'projects') {
    // Prefer the greychair.digital key — projects From is not on spiralgrooverecords.com.
    return firstEnv('SGR_PROJECTS_SMTP_URL', 'PROJECTS_SMTP_URL', 'SGR_ALERTS_SMTP_URL', 'ALERTS_SMTP_URL', 'SGR_SMTP_URL')
  }
  return firstEnv('SGR_SMTP_URL')
}

/** True once SMTP is set up; until then callers keep posting to the Make webhooks. */
export function directMailEnabled() {
  return Boolean(process.env.SGR_SMTP_URL)
}

function transport(account) {
  const url = smtpUrl(account)
  if (!url) throw new Error(`No SMTP URL configured for mail account "${account}"`)
  let t = transports.get(url)
  if (!t) {
    t = nodemailer.createTransport(url)
    transports.set(url, t)
  }
  return t
}

function parseFrom(from) {
  const m = String(from).match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/)
  return m ? { name: m[1].trim() || undefined, address: m[2].trim() } : { address: String(from).trim() }
}

function mailFromEnv(account) {
  if (account === 'sgr') return firstEnv('SGR_MAIL_FROM')
  if (account === 'projects') return firstEnv('SGR_PROJECTS_MAIL_FROM', 'PROJECTS_MAIL_FROM')
  if (account === 'alerts') return firstEnv('SGR_ALERTS_MAIL_FROM', 'ALERTS_MAIL_FROM')
  return undefined
}

export function buildFrom(account, { fromName, fromAddress } = {}) {
  const def = parseFrom(mailFromEnv(account) || DEFAULT_FROM[account])
  const address = fromAddress || def.address
  const name = fromName || def.name
  return name ? { name, address } : address
}

/**
 * @param {'sgr'|'projects'|'alerts'} account
 * @param {{to: string|string[], subject: string, html: string, replyTo?: string, fromName?: string, fromAddress?: string}} mail
 */
export async function sendMail(account, mail) {
  const to = (Array.isArray(mail.to) ? mail.to : [mail.to]).map((s) => String(s || '').trim()).filter(Boolean)
  if (to.length === 0) throw new Error('Email has no recipient')
  const message = {
    from: buildFrom(account, mail),
    to,
    subject: mail.subject || '',
    html: mail.html || '',
    replyTo: String(mail.replyTo || '').trim() || undefined,
  }
  if (process.env.MAIL_DRY_RUN === '1' || process.env.MAIL_DRY_RUN === 'true') {
    console.log('[Mailer] MAIL_DRY_RUN, not sent:', JSON.stringify({ account, ...message, html: `${message.html.length} chars` }))
    return { ok: true, dryRun: true }
  }
  const info = await transport(account).sendMail(message)
  return { ok: true, messageId: info?.messageId }
}
