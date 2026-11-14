/**
 * Direct email sending (replaces the Make.com email relay scenarios).
 *
 * Accounts, like the Make connections they replace:
 *   sgr       "Spiral Groove Records" <spiralgrooverecords@greychair.io>  customer email (was "sgr_gmail")
 *   projects  general@greychair.io                                        inquiries + sale alerts to the store (was "Projects")
 *   alerts    alerts sender                                               error alerts
 *
 * Env:
 *   SGR_SMTP_URL       SMTP URL for the sgr account, e.g.
 *                      smtps://user%40greychair.io:<app-password>@smtp.gmail.com:465
 *                      or smtps://resend:<api-key>@smtp.resend.com:465
 *                      Setting it switches the site from Make to direct sending.
 *   PROJECTS_SMTP_URL  SMTP URL for the projects account (default: SGR_SMTP_URL)
 *   ALERTS_SMTP_URL    SMTP URL for alerts (default: PROJECTS_SMTP_URL, then SGR_SMTP_URL)
 *   SGR_MAIL_FROM / PROJECTS_MAIL_FROM / ALERTS_MAIL_FROM   override the From header
 *   MAIL_DRY_RUN=1     log instead of sending
 */
import nodemailer from 'nodemailer'

const DEFAULT_FROM = {
  sgr: '"Spiral Groove Records" <spiralgrooverecords@greychair.io>',
  projects: 'general@greychair.io',
  alerts: '"Spiral Groove Alerts" <general@greychair.io>',
}

const transports = new Map()

function smtpUrl(account) {
  const env = process.env
  if (account === 'alerts') return env.ALERTS_SMTP_URL || env.PROJECTS_SMTP_URL || env.SGR_SMTP_URL
  if (account === 'projects') return env.PROJECTS_SMTP_URL || env.SGR_SMTP_URL
  return env.SGR_SMTP_URL
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

export function buildFrom(account, { fromName, fromAddress } = {}) {
  const def = parseFrom(process.env[`${account.toUpperCase()}_MAIL_FROM`] || DEFAULT_FROM[account])
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
