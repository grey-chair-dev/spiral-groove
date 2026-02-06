import crypto from 'crypto'

/**
 * Email HTML Templates
 * Generates HTML email content for each email type
 * Matches the Spiral Groove Records website design
 */

const BRAND = {
  black: '#231F20',
  cream: '#FFF9F0',
  white: '#FFFFFF',
  orange: '#00C2CB',  // Matches tailwind.config.js (actually cyan, but used as "orange" in the site)
  teal: '#3AB795',    // Matches tailwind.config.js
  red: '#FF2E63',
  mustard: '#F9D776',
  gray600: '#666666',
  gray500: '#999999',
  gray200: '#E5E5E5',
}

function getBaseUrl() {
  // Prefer an explicit SITE_URL. Otherwise, use Vercel's deployment URL so
  // assets like /full-logo.png resolve even if a custom domain is misconfigured.
  const raw = process.env.SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://spiralgrooverecords.com')
  const normalized = raw.startsWith('http://') || raw.startsWith('https://') ? raw : `https://${raw}`
  return normalized.replace(/\/+$/, '')
}

function getSquareDashboardBaseUrl() {
  const env = (process.env.SQUARE_ENVIRONMENT || process.env.SQUARE_ENV || '').toLowerCase()
  return env === 'sandbox' ? 'https://squareupsandbox.com' : 'https://squareup.com'
}

function getSquareOrderDashboardUrl(squareOrderId) {
  const id = String(squareOrderId || '').trim()
  if (!id) return null
  return `${getSquareDashboardBaseUrl()}/dashboard/sales/orders/${encodeURIComponent(id)}`
}

function getSquarePaymentDashboardUrl(squarePaymentId) {
  const id = String(squarePaymentId || '').trim()
  if (!id) return null
  return `${getSquareDashboardBaseUrl()}/dashboard/sales/transactions/${encodeURIComponent(id)}`
}

function getEmailLogoUrl(baseUrl) {
  const override = process.env.EMAIL_LOGO_URL || ''
  if (override) return override
  return `${baseUrl}/full-logo.png`
}

function getReviewUrl() {
  // Configurable review link for post-pickup follow-up.
  // Prefer SGR_* naming, but support a generic REVIEW_URL too.
  return (
    process.env.SGR_REVIEW_URL ||
    process.env.REVIEW_URL ||
    'https://www.facebook.com/spiralgrooverecords/reviews/?id=100063558614296&sk=reviews'
  )
}

function getSecondaryReviewUrl() {
  // Optional secondary review destination (e.g., Google).
  return (
    process.env.SGR_REVIEW_URL_SECONDARY ||
    process.env.REVIEW_URL_SECONDARY ||
    'https://www.google.com/maps/place/Spiral+Groove+Records/@39.1742742,-84.2984339,17z/data=!3m2!4b1!5s0x8841aac9305a4841:0xf7aca0c9046f7901!4m6!3m5!1s0x8841aab22ada7577:0xab535c9a0a82b016!8m2!3d39.1742742!4d-84.295859!16s%2Fg%2F11dfxntdfb?entry=ttu'
  )
}

function getContactEmail() {
  return process.env.CONTACT_EMAIL || 'adam@spiralgrooverecords.com'
}

function escapeHtml(value) {
  // Some upstream data (or DB content) can already be HTML-escaped (e.g. "R&amp;B").
  // If we escape again, email clients render the entity literally ("&amp;").
  // Decode common entities first, then escape once for safety.
  const raw = String(value ?? '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    // Decode numeric entities (best-effort)
    .replace(/&#(\d+);/g, (_, n) => {
      const code = Number.parseInt(String(n), 10)
      return Number.isFinite(code) ? String.fromCharCode(code) : _
    })
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      const code = Number.parseInt(String(hex), 16)
      return Number.isFinite(code) ? String.fromCharCode(code) : _
    })

  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function base64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function getUnsubscribeSecret() {
  return process.env.NEWSLETTER_UNSUBSCRIBE_SECRET || process.env.JWT_SECRET || ''
}

function createNewsletterUnsubscribeToken(email) {
  const secret = getUnsubscribeSecret()
  if (!secret) return null
  const normalized = String(email || '').trim().toLowerCase()
  const mac = crypto.createHmac('sha256', secret).update(normalized).digest()
  return base64url(mac)
}

function encodeQuery(value) {
  return encodeURIComponent(String(value || ''))
}

function renderButton({ href, label, tone = 'orange' }) {
  const bg = tone === 'teal' ? BRAND.teal : tone === 'black' ? BRAND.black : BRAND.orange
  const fg = tone === 'black' ? BRAND.cream : BRAND.black

  return `
    <div style="text-align:center; margin: 26px 0 0 0;">
      <a href="${href}" style="display:inline-block; padding: 14px 22px; background-color: ${bg}; color: ${fg}; text-decoration:none; border-radius: 999px; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 0.14em; border: 2px solid ${BRAND.black}; box-shadow: 6px 6px 0px 0px ${BRAND.black};">
        ${escapeHtml(label)}
      </a>
    </div>
  `.trim()
}

function renderLayout({ title, preheader, bodyHtml }) {
  const baseUrl = getBaseUrl()
  const logoUrl = getEmailLogoUrl(baseUrl)
  const contactEmail = getContactEmail()

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Shrikhand&display=swap" rel="stylesheet">
  <style>
    /* Mobile-only: make the newsletter "hero" header black so Gmail iOS dark mode can't wash out the text. */
    @media screen and (max-width: 520px) {
      .sg-mobile-hero {
        background: ${BRAND.black} !important;
        border-color: ${BRAND.black} !important;
      }
      .sg-mobile-hero,
      .sg-mobile-hero p,
      .sg-mobile-hero h1,
      .sg-mobile-hero h2,
      .sg-mobile-hero h3,
      .sg-mobile-hero span {
        color: ${BRAND.cream} !important;
      }
      .sg-mobile-hero .sg-accent {
        color: ${BRAND.orange} !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; background-color: ${BRAND.cream}; color: ${BRAND.black};">
  <div style="display:none; font-size:1px; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">
    ${escapeHtml(preheader || '')}
  </div>

  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: ${BRAND.cream};">
    <tr>
      <td style="padding: 0;">
        <table role="presentation" bgcolor="${BRAND.black}" style="width: 100%; border-collapse: collapse; max-width: 680px; margin: 0 auto; background-color: ${BRAND.black}; border-bottom: 4px solid ${BRAND.orange};">
          <tr>
            <td style="padding: 18px 18px 14px 18px; text-align: center;">
              <a href="${baseUrl}" style="text-decoration:none; display:inline-block;">
                <img src="${logoUrl}" alt="Spiral Groove Records" width="220" style="display:block; width:220px; max-width: 80%; height:auto; border:0; outline:none; text-decoration:none;" />
              </a>
              <div style="margin-top: 10px; font-size: 11px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase;">
                <span style="color: ${BRAND.teal};">Order online, pick up in-store</span>
                <span style="color: ${BRAND.gray600}; padding: 0 10px;">|</span>
                <span style="color: ${BRAND.red};">We buy used vinyl</span>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding: 0;">
        <table role="presentation" bgcolor="${BRAND.cream}" style="width: 100%; border-collapse: collapse; max-width: 680px; margin: 0 auto; background-color: ${BRAND.cream};">
          <tr>
            <td bgcolor="${BRAND.cream}" style="padding: 0; background-color: ${BRAND.cream};">
              <!-- Gmail iOS dark mode can wash out text on light patterned backgrounds.
                   Use a clean white card for the body to render consistently across clients. -->
              <div style="margin: 0 14px; border: 2px solid ${BRAND.black}; box-shadow: 8px 8px 0px 0px ${BRAND.black}; background: ${BRAND.white};">
                <div style="padding: 34px 22px 28px 22px; background-color: ${BRAND.white}; color: ${BRAND.black};">
                  ${bodyHtml}
                </div>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding: 0;">
        <table role="presentation" bgcolor="${BRAND.black}" style="width: 100%; border-collapse: collapse; max-width: 680px; margin: 0 auto; background-color: ${BRAND.black}; border-top: 4px solid ${BRAND.orange};">
          <tr>
            <td style="padding: 22px 18px; text-align: center; color: ${BRAND.cream}; font-size: 12px;">
              <p style="margin: 0 0 6px 0; font-weight: 800; letter-spacing: 0.04em;">Spiral Groove Records</p>
              <p style="margin: 0 0 10px 0; color: ${BRAND.gray500};">215B Main Street, Milford, OH 45150</p>
              <p style="margin: 0;">
                <a href="${baseUrl}" style="color: ${BRAND.teal}; text-decoration: none; font-weight: 700; margin: 0 10px;">Visit the site</a>
                <span style="color: ${BRAND.gray600};">|</span>
                <a href="mailto:${contactEmail}" style="color: ${BRAND.teal}; text-decoration: none; font-weight: 700; margin: 0 10px;">Contact</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

/**
 * Generate newsletter signup welcome email HTML
 */
export function generateNewsletterEmail(data) {
  const { firstName, lastName, email } = data
  const name = firstName ? `${firstName} ${lastName || ''}`.trim() : email.split('@')[0]
  const baseUrl = getBaseUrl()
  const token = createNewsletterUnsubscribeToken(email)
  const unsubscribeUrl = token
    ? `${baseUrl}/api/newsletter/unsubscribe?email=${encodeQuery(email)}&token=${encodeQuery(token)}`
    : null

  const bodyHtml = `
    <h2 style="margin: 0 0 14px 0; font-family: Shrikhand, cursive; color: ${BRAND.black}; font-size: 32px; line-height: 1.15; letter-spacing: 0.02em;">
      Welcome to the Groove, <span style="color:${BRAND.orange};">${escapeHtml(name)}</span>!
    </h2>
    <p style="margin: 0 0 14px 0; color: ${BRAND.black}; font-size: 16px; line-height: 1.7; font-weight: 600;">
      Thanks for joining our newsletter. You’re officially in the crate-digging circle.
    </p>

    <div style="margin: 18px 0 0 0; padding: 18px; background-color: ${BRAND.white}; border: 2px solid ${BRAND.black}; border-radius: 12px; box-shadow: 4px 4px 0px 0px ${BRAND.black};">
      <p style="margin: 0 0 10px 0; font-size: 12px; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase; color: ${BRAND.gray600};">
        What you’ll get
      </p>
      <ul style="margin: 0; padding-left: 18px; color: ${BRAND.black}; font-size: 15px; line-height: 1.9; font-weight: 600;">
        <li>New arrivals + restocks</li>
        <li>Events + in-store drops</li>
        <li>Staff picks + essential listening</li>
        <li>Occasional deals worth opening</li>
      </ul>
    </div>

    ${renderButton({ href: `${baseUrl}/catalog`, label: 'Browse the catalog', tone: 'orange' })}

    <p style="margin: 20px 0 0 0; color: ${BRAND.gray600}; font-size: 12px; line-height: 1.6; font-weight: 600; text-align:center;">
      ${unsubscribeUrl ? `Want fewer emails? <a href="${unsubscribeUrl}" style="color:${BRAND.teal}; font-weight: 800; text-decoration:none;">Unsubscribe</a>.` : 'Want fewer emails? Reply to this email and ask to unsubscribe.'}
    </p>
  `.trim()

  return renderLayout({
    title: 'Welcome to Spiral Groove Records Newsletter',
    preheader: 'You’re in — new arrivals, events, and staff picks.',
    bodyHtml,
  })
}

/**
 * Generate user signup welcome email HTML
 */
export function generateSignupEmail(data) {
  const { name, email } = data
  const displayName = name || email.split('@')[0]
  const baseUrl = getBaseUrl()

  const bodyHtml = `
    <h2 style="margin: 0 0 14px 0; font-family: Shrikhand, cursive; color: ${BRAND.black}; font-size: 32px; line-height: 1.15; letter-spacing: 0.02em;">
      Welcome, <span style="color:${BRAND.orange};">${escapeHtml(displayName)}</span>.
    </h2>
    <p style="margin: 0 0 14px 0; color: ${BRAND.black}; font-size: 16px; line-height: 1.7; font-weight: 600;">
      Your Spiral Groove account is live. Time to dig.
    </p>

    <div style="margin: 18px 0 0 0; padding: 18px; background-color: ${BRAND.white}; border: 2px solid ${BRAND.black}; border-radius: 12px; box-shadow: 4px 4px 0px 0px ${BRAND.black};">
      <p style="margin: 0 0 10px 0; font-size: 12px; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase; color: ${BRAND.gray600};">
        With your account
      </p>
      <ul style="margin: 0; padding-left: 18px; color: ${BRAND.black}; font-size: 15px; line-height: 1.9; font-weight: 600;">
        <li>Faster checkout</li>
        <li>Order tracking in one spot</li>
        <li>Saved picks and favorites</li>
      </ul>
    </div>

    ${renderButton({ href: `${baseUrl}/catalog`, label: 'Start shopping', tone: 'orange' })}
  `.trim()

  return renderLayout({
    title: 'Welcome to Spiral Groove Records',
    preheader: 'Your account is live — start digging.',
    bodyHtml,
  })
}

/**
 * Generate order confirmation email HTML
 */
export function generateOrderConfirmationEmail(data) {
  const {
    orderNumber,
    customerName,
    customerEmail,
    total,
    currency = 'USD',
    items = [],
    deliveryMethod,
    pickupLocation,
  } = data
  
  const currencySymbol = currency === 'USD' ? '$' : ''
  const formattedTotal = `${currencySymbol}${parseFloat(total).toFixed(2)}`
  
  const itemsHtml = items.map(item => {
    const itemPrice = typeof item.price === 'number' ? item.price.toFixed(2) : (item.price || '0.00')
    const itemTotal = typeof item.quantity === 'number' && typeof item.price === 'number' 
      ? (item.quantity * item.price).toFixed(2) 
      : itemPrice
    return `
      <tr>
        <td style="padding: 14px 12px; border-bottom: 1px solid #E5E5E5; color: #231F20; font-weight: 500;">${item.name || 'Item'}</td>
        <td style="padding: 14px 12px; border-bottom: 1px solid #E5E5E5; text-align: center; color: #231F20; font-weight: 500;">${item.quantity || 1}</td>
        <td style="padding: 14px 12px; border-bottom: 1px solid #E5E5E5; text-align: right; color: #231F20; font-weight: 500;">${currencySymbol}${itemPrice}</td>
        <td style="padding: 14px 12px; border-bottom: 1px solid #E5E5E5; text-align: right; color: #231F20; font-weight: bold;">${currencySymbol}${itemTotal}</td>
      </tr>
    `
  }).join('')

  const baseUrl = getBaseUrl()
  const safeCustomerName = escapeHtml(customerName || 'Valued Customer')
  const safeOrderNumber = escapeHtml(orderNumber || '')
  const pickupLine = deliveryMethod === 'pickup'
    ? escapeHtml(pickupLocation || '215B Main Street, Milford, OH 45150')
    : 'Your order will be shipped to the address provided during checkout.'

  const bodyHtml = `
    <div style="text-align:center; margin-bottom: 18px;">
      <div style="display:inline-block; width: 72px; height: 72px; border-radius: 999px; background-color: ${BRAND.teal}; border: 2px solid ${BRAND.black}; box-shadow: 4px 4px 0px 0px ${BRAND.black}; line-height: 72px; font-weight: 900; color: ${BRAND.black}; font-size: 34px;">
        ✓
      </div>
    </div>

    <h2 style="margin: 0 0 10px 0; font-family: Shrikhand, cursive; color: ${BRAND.black}; font-size: 34px; line-height: 1.1; text-align:center; letter-spacing: 0.02em;">
      Order confirmed
    </h2>
    <p style="margin: 0 0 18px 0; color: ${BRAND.black}; font-size: 16px; line-height: 1.7; font-weight: 600; text-align:center;">
      Thanks, ${safeCustomerName}. We’re getting it ready.
    </p>

    <div style="margin: 18px 0 0 0; padding: 18px; background-color: ${BRAND.black}; border: 2px solid ${BRAND.black}; border-radius: 12px; box-shadow: 4px 4px 0px 0px ${BRAND.orange};">
      <p style="margin: 0 0 8px 0; color: ${BRAND.cream}; font-size: 12px; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase;">
        Order number
      </p>
      <p style="margin: 0; color: ${BRAND.teal}; font-size: 22px; font-weight: 900; letter-spacing: 0.06em;">
        ${safeOrderNumber}
      </p>
    </div>

    <h3 style="margin: 22px 0 10px 0; font-family: Shrikhand, cursive; color: ${BRAND.black}; font-size: 22px; letter-spacing: 0.02em;">
      Items
    </h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px; background-color: ${BRAND.white}; border: 2px solid ${BRAND.black}; border-radius: 12px; overflow: hidden;">
      <thead>
        <tr style="background-color: ${BRAND.black};">
          <th style="padding: 12px 10px; text-align: left; color: ${BRAND.cream}; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;">Item</th>
          <th style="padding: 12px 10px; text-align: center; color: ${BRAND.cream}; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;">Qty</th>
          <th style="padding: 12px 10px; text-align: right; color: ${BRAND.cream}; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;">Price</th>
          <th style="padding: 12px 10px; text-align: right; color: ${BRAND.cream}; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div style="margin: 0 0 14px 0; padding: 14px 16px; background-color: ${BRAND.white}; border: 2px solid ${BRAND.black}; border-radius: 12px;">
      <p style="margin: 0; color: ${BRAND.black}; font-size: 16px; font-weight: 900; text-align: right;">
        Total: <span style="font-size: 22px; letter-spacing: 0.02em;">${escapeHtml(formattedTotal)}</span>
      </p>
    </div>

    <div style="margin: 0; padding: 14px 16px; background-color: ${BRAND.white}; border: 2px solid ${BRAND.black}; border-radius: 12px;">
      <p style="margin: 0 0 8px 0; color: ${BRAND.gray600}; font-size: 12px; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase;">
        ${deliveryMethod === 'pickup' ? 'Pickup location' : 'Shipping'}
      </p>
      <p style="margin: 0; color: ${BRAND.black}; font-size: 15px; line-height: 1.6; font-weight: 600;">
        ${pickupLine}
      </p>
    </div>

    ${deliveryMethod === 'pickup' ? `
      <div style="margin-top: 14px; padding: 14px 16px; background-color: ${BRAND.mustard}; border: 2px solid ${BRAND.black}; border-radius: 12px; box-shadow: 4px 4px 0px 0px ${BRAND.black};">
        <p style="margin: 0; color: ${BRAND.black}; font-size: 14px; line-height: 1.6; font-weight: 700;">
          <strong>Pickup tip:</strong> We’ll email when it’s ready. Bring a valid ID.
        </p>
      </div>
    ` : ''}

    ${renderButton({
      href: `${baseUrl}/order-status?order=${encodeURIComponent(orderNumber || '')}&email=${encodeURIComponent(customerEmail || '')}`,
      label: 'Track your order',
      tone: 'teal',
    })}
  `.trim()

  return renderLayout({
    title: `Order Confirmation ${orderNumber || ''}`.trim(),
    preheader: `Order ${orderNumber || ''} confirmed. Track status and details.`,
    bodyHtml,
  })
}

/**
 * Generate forgot password reset email HTML
 */
export function generateForgotPasswordEmail(data) {
  const { email, resetUrl, expiresIn = '1 hour' } = data
  const safeEmail = escapeHtml(email)
  const safeResetUrl = String(resetUrl || '')
  const safeExpires = escapeHtml(expiresIn)

  const bodyHtml = `
    <h2 style="margin: 0 0 14px 0; font-family: Shrikhand, cursive; color: ${BRAND.black}; font-size: 32px; line-height: 1.15; letter-spacing: 0.02em;">
      Reset your password
    </h2>
    <p style="margin: 0 0 14px 0; color: ${BRAND.black}; font-size: 16px; line-height: 1.7; font-weight: 600;">
      We received a request to reset the password for <strong>${safeEmail}</strong>.
    </p>
    <p style="margin: 0 0 14px 0; color: ${BRAND.black}; font-size: 16px; line-height: 1.7; font-weight: 600;">
      This link expires in <strong>${safeExpires}</strong>.
    </p>

    ${renderButton({ href: safeResetUrl, label: 'Reset password', tone: 'teal' })}

    <p style="margin: 18px 0 10px 0; color: ${BRAND.black}; font-size: 13px; line-height: 1.6; font-weight: 600;">
      If the button doesn’t work, copy and paste this link into your browser:
    </p>
    <div style="padding: 12px 12px; background-color: ${BRAND.white}; border: 2px solid ${BRAND.black}; border-radius: 12px; word-break: break-all; color: ${BRAND.black}; font-size: 11px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace; line-height: 1.6;">
      ${escapeHtml(safeResetUrl)}
    </div>

    <div style="margin-top: 14px; padding: 14px 16px; background-color: ${BRAND.mustard}; border: 2px solid ${BRAND.black}; border-radius: 12px; box-shadow: 4px 4px 0px 0px ${BRAND.black};">
      <p style="margin: 0; color: ${BRAND.black}; font-size: 14px; line-height: 1.6; font-weight: 700;">
        <strong>Security note:</strong> If you didn’t request this, ignore this email—your password won’t change.
      </p>
    </div>
  `.trim()

  return renderLayout({
    title: 'Reset Your Password',
    preheader: 'Reset link inside (expires soon).',
    bodyHtml,
  })
}

/**
 * Generate order status update email HTML
 */
export function generateOrderStatusUpdateEmail(data) {
  const {
    orderNumber,
    customerName,
    customerEmail,
    status,
    previousStatus,
    statusMessage,
    items = [],
    total,
    currency = 'USD',
    deliveryMethod,
    pickupLocation,
    trackingNumber,
    estimatedDelivery,
  } = data
  
  const currencySymbol = currency === 'USD' ? '$' : ''
  const formattedTotal = `${currencySymbol}${parseFloat(total || 0).toFixed(2)}`
  
  // Status-specific messaging
  const getStatusInfo = (status) => {
    const statusUpper = (status || '').toUpperCase()
    switch (statusUpper) {
      case 'PREPARED':
      case 'READY':
      case 'READY_FOR_PICKUP':
        return {
          title: 'Your Order is Ready for Pickup!',
          message: 'Great news! Your order is ready for pickup at our store.',
          icon: '📦',
          color: '#3AB795',
          actionText: 'Pickup Instructions',
          actionMessage: 'Please bring a valid ID when you arrive. We\'re open Monday-Saturday 10am-8pm, Sunday 12pm-6pm.',
        }
      case 'SHIPPED':
        return {
          title: 'Your Order Has Shipped!',
          message: 'Your order is on its way to you.',
          icon: '🚚',
          color: '#00C2CB',
          actionText: 'Track Your Order',
          actionMessage: trackingNumber ? `Tracking Number: ${trackingNumber}` : 'We\'ll send tracking information soon.',
        }
      case 'COMPLETED':
      case 'DELIVERED':
      case 'PICKED_UP':
        return {
          title: 'Order Complete!',
          message: 'Thank you for your order! We hope you enjoy your purchase.',
          icon: '✓',
          color: '#3AB795',
          actionText: 'Shop Again',
          actionMessage: 'Browse our latest arrivals and discover your next favorite record.',
        }
      case 'CANCELLED':
      case 'CANCELED':
        return {
          title: 'Order Cancelled',
          message: 'Your order has been cancelled. If you have questions, please contact us.',
          icon: '⚠️',
          color: '#FF2E63',
          actionText: 'Contact Us',
          actionMessage: 'We\'re here to help if you need assistance.',
        }
      default:
        return {
          title: 'Order Status Updated',
          message: `Your order status has been updated to: ${status}`,
          icon: '📋',
          color: '#00C2CB',
          actionText: 'View Order',
          actionMessage: 'Check your order details below.',
        }
    }
  }
  
  const statusInfo = getStatusInfo(status)
  
  const itemsHtml = items.length > 0 ? items.map(item => {
    const itemPrice = typeof item.price === 'number' ? item.price.toFixed(2) : (item.price || '0.00')
    return `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #E5E5E5; color: #231F20; font-weight: 500;">${item.name || 'Item'}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #E5E5E5; text-align: center; color: #231F20; font-weight: 500;">${item.quantity || 1}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #E5E5E5; text-align: right; color: #231F20; font-weight: 500;">${currencySymbol}${itemPrice}</td>
      </tr>
    `
  }).join('') : ''

  const baseUrl = getBaseUrl()
  const safeOrderNumber = escapeHtml(orderNumber || '')
  const safeStatusTitle = escapeHtml(statusInfo.title)
  const safeMessage = escapeHtml(statusMessage || statusInfo.message || '')
  const safeActionText = escapeHtml(statusInfo.actionText || 'View order')
  const safeActionMessage = escapeHtml(statusInfo.actionMessage || '')

  const cardAccent = statusInfo.color || BRAND.teal
  const actionTone = cardAccent === '#00C2CB' ? 'teal' : 'orange'

  const bodyHtml = `
    <div style="text-align:center; margin-bottom: 18px;">
      <div style="display:inline-block; width: 72px; height: 72px; border-radius: 999px; background-color: ${cardAccent}; border: 2px solid ${BRAND.black}; box-shadow: 4px 4px 0px 0px ${BRAND.black}; line-height: 72px; font-weight: 900; color: ${BRAND.black}; font-size: 34px;">
        ${escapeHtml(statusInfo.icon || '✓')}
      </div>
    </div>

    <h2 style="margin: 0 0 10px 0; font-family: Shrikhand, cursive; color: ${BRAND.black}; font-size: 32px; line-height: 1.1; text-align:center; letter-spacing: 0.02em;">
      ${safeStatusTitle}
    </h2>
    <p style="margin: 0 0 18px 0; color: ${BRAND.black}; font-size: 16px; line-height: 1.7; font-weight: 600; text-align:center;">
      ${safeMessage}
    </p>

    <div style="margin: 18px 0 0 0; padding: 18px; background-color: ${BRAND.black}; border: 2px solid ${BRAND.black}; border-radius: 12px; box-shadow: 4px 4px 0px 0px ${cardAccent};">
      <p style="margin: 0 0 8px 0; color: ${BRAND.cream}; font-size: 12px; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase;">
        Order number
      </p>
      <p style="margin: 0; color: ${BRAND.teal}; font-size: 22px; font-weight: 900; letter-spacing: 0.06em;">
        ${safeOrderNumber}
      </p>
    </div>

    ${items.length > 0 ? `
      <h3 style="margin: 22px 0 10px 0; font-family: Shrikhand, cursive; color: ${BRAND.black}; font-size: 22px; letter-spacing: 0.02em;">
        Items
      </h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px; background-color: ${BRAND.white}; border: 2px solid ${BRAND.black}; border-radius: 12px; overflow: hidden;">
        <thead>
          <tr style="background-color: ${BRAND.black};">
            <th style="padding: 12px 10px; text-align: left; color: ${BRAND.cream}; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;">Item</th>
            <th style="padding: 12px 10px; text-align: center; color: ${BRAND.cream}; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;">Qty</th>
            <th style="padding: 12px 10px; text-align: right; color: ${BRAND.cream}; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
    ` : ''}

    ${total ? `
      <div style="margin: 0 0 14px 0; padding: 14px 16px; background-color: ${BRAND.white}; border: 2px solid ${BRAND.black}; border-radius: 12px;">
        <p style="margin: 0; color: ${BRAND.black}; font-size: 16px; font-weight: 900; text-align: right;">
          Total: <span style="font-size: 22px; letter-spacing: 0.02em;">${escapeHtml(formattedTotal)}</span>
        </p>
      </div>
    ` : ''}

    ${(deliveryMethod === 'pickup' && pickupLocation) ? `
      <div style="margin: 0 0 14px 0; padding: 14px 16px; background-color: ${BRAND.white}; border: 2px solid ${BRAND.black}; border-radius: 12px;">
        <p style="margin: 0 0 8px 0; color: ${BRAND.gray600}; font-size: 12px; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase;">
          Pickup location
        </p>
        <p style="margin: 0; color: ${BRAND.black}; font-size: 15px; line-height: 1.6; font-weight: 600;">
          ${escapeHtml(pickupLocation)}
        </p>
      </div>
    ` : ''}

    ${safeActionMessage ? `
      <div style="margin-top: 14px; padding: 14px 16px; background-color: ${cardAccent === BRAND.red ? BRAND.mustard : cardAccent}; border: 2px solid ${BRAND.black}; border-radius: 12px; box-shadow: 4px 4px 0px 0px ${BRAND.black};">
        <p style="margin: 0; color: ${BRAND.black}; font-size: 14px; line-height: 1.6; font-weight: 700;">
          <strong>${safeActionText}:</strong> ${safeActionMessage}
        </p>
      </div>
    ` : ''}

    ${estimatedDelivery ? `
      <div style="margin-top: 14px; padding: 14px 16px; background-color: ${BRAND.white}; border: 2px solid ${BRAND.black}; border-radius: 12px;">
        <p style="margin: 0; color: ${BRAND.black}; font-size: 14px; line-height: 1.6; font-weight: 700;">
          <strong>Estimated delivery:</strong> ${escapeHtml(estimatedDelivery)}
        </p>
      </div>
    ` : ''}

    ${renderButton({
      href: `${baseUrl}/order-status?order=${encodeURIComponent(orderNumber || '')}&email=${encodeURIComponent(customerEmail || '')}`,
      label: 'View order details',
      tone: actionTone,
    })}
  `.trim()

  return renderLayout({
    title: `Order Status Update ${orderNumber || ''}`.trim(),
    preheader: `Update for order ${orderNumber || ''}.`,
    bodyHtml,
  })
}

/**
 * Separate review request email (sent after pickup / completion).
 */
export function generateReviewRequestEmail(data) {
  const { orderNumber, customerName } = data || {}
  const baseUrl = getBaseUrl()
  const reviewUrl = getReviewUrl()
  const secondaryReviewUrl = getSecondaryReviewUrl()

  const safeName = escapeHtml(customerName || 'friend')
  const safeOrderNumber = escapeHtml(orderNumber || '')

  const bodyHtml = `
    <h2 style="margin: 0 0 10px 0; font-family: Shrikhand, cursive; color: ${BRAND.black}; font-size: 32px; line-height: 1.1; text-align:center; letter-spacing: 0.02em;">
      How’d we do?
    </h2>
    <p style="margin: 0 0 16px 0; color: ${BRAND.black}; font-size: 16px; line-height: 1.7; font-weight: 600; text-align:center;">
      Thanks for stopping by, ${safeName}. If you’ve got 30 seconds, a quick review helps more people find Spiral Groove.
    </p>

    <div style="margin: 18px 0 16px 0; padding: 16px 18px; background-color: ${BRAND.mustard}; border: 2px solid ${BRAND.black}; border-radius: 12px; box-shadow: 4px 4px 0px 0px ${BRAND.black};">
      <p style="margin: 0; color: ${BRAND.black}; font-size: 13px; line-height: 1.6; font-weight: 800;">
        Order: <span style="letter-spacing: 0.04em;">${safeOrderNumber}</span>
      </p>
    </div>

    ${renderButton({ href: reviewUrl, label: 'Leave a review on Facebook', tone: 'teal' })}

    <div style="margin-top: 12px;">
      ${renderButton({ href: secondaryReviewUrl, label: 'Leave a review on Google', tone: 'orange' })}
    </div>

    <div style="margin-top: 18px;">
      ${renderButton({
        href: `${baseUrl}/catalog/${encodeURIComponent('New Arrivals')}`,
        label: 'Browse new arrivals',
        tone: 'orange',
      })}
    </div>
  `.trim()

  return renderLayout({
    title: 'Leave a Review - Spiral Groove Records',
    preheader: 'A quick review helps a ton.',
    bodyHtml,
  })
}

/**
 * Generate weekly newsletter email HTML
 * Includes: upcoming events, new records, and personalized recommendations
 */
export function generateWeeklyNewsletterEmail(data) {
  const {
    firstName,
    lastName,
    email,
    upcomingEvents = [],
    newRecords = [],
    recommendations = [],
  } = data
  
  const name = firstName ? `${firstName} ${lastName || ''}`.trim() : email.split('@')[0]
  const baseUrl = getBaseUrl()
  const token = createNewsletterUnsubscribeToken(email)
  const unsubscribeUrl = token
    ? `${baseUrl}/api/newsletter/unsubscribe?email=${encodeQuery(email)}&token=${encodeQuery(token)}`
    : null

  // Render upcoming events section
  const eventsHtml = upcomingEvents.length > 0 ? `
    <h3 style="margin: 28px 0 14px 0; font-family: Shrikhand, cursive; color: ${BRAND.black}; font-size: 24px; letter-spacing: 0.02em;">
      🎵 This Week's Events
    </h3>
    ${upcomingEvents.map(event => {
      const eventDate = event.date_label || event.date_iso || ''
      const eventTime = event.start_time_label || event.start_time || ''
      const eventName = escapeHtml(event.event_name || event.artist || 'Event')
      const venue = escapeHtml(event.venue || '')
      const eventUrlRaw =
        (event.event_permalink && String(event.event_permalink).trim()) ||
        (event.id ? `${baseUrl}/events#event-${event.id}` : `${baseUrl}/events`)
      const eventUrl = escapeHtml(eventUrlRaw)
      
      return `
        <a href="${eventUrl}" target="_blank" rel="noopener noreferrer" style="display:block; text-decoration:none; color: inherit;">
          <div style="margin: 0 0 16px 0; padding: 16px; background-color: ${BRAND.white}; border: 2px solid ${BRAND.black}; border-radius: 12px; box-shadow: 4px 4px 0px 0px ${BRAND.black};">
            <p style="margin: 0 0 6px 0; color: ${BRAND.orange}; font-size: 12px; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase;">
              ${eventDate}${eventTime ? ` • ${eventTime}` : ''}
            </p>
            <p style="margin: 0 0 4px 0; color: ${BRAND.black}; font-size: 18px; font-weight: 800; line-height: 1.3;">
              ${eventName}
            </p>
            ${venue ? `<p style="margin: 0; color: ${BRAND.gray600}; font-size: 14px; font-weight: 600;">${venue}</p>` : ''}
          </div>
        </a>
      `
    }).join('')}
    ${renderButton({ href: `${baseUrl}/events`, label: 'View all events', tone: 'teal' })}
  ` : ''

  // Helper to ensure absolute image URLs
  function getAbsoluteImageUrl(imageUrl) {
    if (!imageUrl) return `${baseUrl}/images/placeholder.png`
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl
    if (imageUrl.startsWith('/')) return `${baseUrl}${imageUrl}`
    return `${baseUrl}/${imageUrl}`
  }

  // Render new records section (exact match to website ProductGrid styling)
  const newRecordsHtml = newRecords.length > 0 ? `
    <h3 style="margin: 28px 0 14px 0; font-family: Shrikhand, cursive; color: ${BRAND.black}; font-size: 24px; letter-spacing: 0.02em;">
      🆕 New Arrivals
    </h3>
    <!-- Gmail mobile renders 6-column grids poorly. Use a consistent 2-column table layout. -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-bottom: 18px; border-collapse: collapse;">
      ${(() => {
        const items = newRecords.slice(0, 12)
        const rows = []
        for (let i = 0; i < items.length; i += 2) {
          const pair = items.slice(i, i + 2)
          const cellsHtml = pair.map((record) => {
            const recordName = escapeHtml(record.name || 'Record')
            const nameParts = recordName.split(' - ')
            const artist = nameParts.length > 1 ? escapeHtml(nameParts[0]) : ''
            const title = nameParts.length > 1 ? escapeHtml(nameParts.slice(1).join(' - ')) : recordName
            const recordPrice = record.price ? `$${Number(record.price).toFixed(2)}` : ''
            const recordImage = getAbsoluteImageUrl(record.image_url)
            const recordUrl = record.id
              ? `${baseUrl}/product/${encodeURIComponent(String(record.id))}`
              : `${baseUrl}/catalog`
            const recordCategory = escapeHtml(record.category || '')

            return `
              <td style="width: 50%; padding: 0 6px 12px 6px; vertical-align: top;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="background-color: ${BRAND.cream};">
                      <a href="${recordUrl}" style="text-decoration: none; display: block;">
                        ${recordCategory ? `
                          <div style="margin: 0 0 8px 0; display: inline-block; background-color: ${BRAND.cream}; color: ${BRAND.black}; padding: 4px 8px; border: 2px solid ${BRAND.black}; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; line-height: 1.2; font-family: 'Inter', system-ui, sans-serif;">
                            ${recordCategory}
                          </div>
                        ` : ''}
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-bottom: 12px; border-collapse: collapse;">
                          <tr>
                            <td style="padding: 0; background-color: ${BRAND.white}; border: 2px solid ${BRAND.black};">
                              <img src="${recordImage}" alt="${title}" width="100%" style="display: block; width: 100%; height: auto; border: 0; outline: none; text-decoration: none;" />
                            </td>
                          </tr>
                        </table>
                        <h3 style="margin: 0 0 4px 0; color: ${BRAND.black}; font-size: 14px; font-weight: 700; line-height: 1.3; font-family: 'Inter', system-ui, sans-serif;">
                          ${title}
                        </h3>
                        ${artist ? `<p style="margin: 0 0 8px 0; color: ${BRAND.black}; opacity: 0.6; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; font-family: 'Inter', system-ui, sans-serif;">${artist}</p>` : ''}
                        ${recordPrice ? `<div style="margin-top: 8px; padding-top: 10px; border-top: 1px solid rgba(35, 31, 32, 0.1);"><span style="color: ${BRAND.black}; font-size: 18px; font-weight: 900; font-family: 'Inter', system-ui, sans-serif; letter-spacing: 0.02em;">${recordPrice}</span></div>` : ''}
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            `
          }).join('')

          // If odd number of items, add an empty cell to keep layout stable.
          const paddedCells = pair.length === 1 ? `${cellsHtml}<td style="width: 50%; padding: 0 6px 12px 6px;"></td>` : cellsHtml

          rows.push(`<tr>${paddedCells}</tr>`)
        }
        return rows.join('')
      })()}
    </table>
    ${renderButton({ href: `${baseUrl}/catalog/${encodeURIComponent('New Arrivals')}`, label: 'Browse all new arrivals', tone: 'orange' })}
  ` : ''

  // Render personalized recommendations section (exact match to website ProductGrid styling)
  const recommendationsHtml = recommendations.length > 0 ? `
    <h3 style="margin: 28px 0 14px 0; font-family: Shrikhand, cursive; color: ${BRAND.black}; font-size: 24px; letter-spacing: 0.02em;">
      💿 Picked for You
    </h3>
    <p style="margin: 0 0 16px 0; color: ${BRAND.gray600}; font-size: 14px; line-height: 1.6; font-weight: 600;">
      Based on your past purchases, we think you'll dig these:
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-bottom: 18px;">
      <tr>
        ${recommendations.slice(0, 6).map(record => {
          const recordName = escapeHtml(record.name || 'Record')
          // Extract artist from name if possible (format: "Artist - Album" or just "Album")
          const nameParts = recordName.split(' - ')
          const artist = nameParts.length > 1 ? escapeHtml(nameParts[0]) : ''
          const title = nameParts.length > 1 ? escapeHtml(nameParts.slice(1).join(' - ')) : recordName
          const recordPrice = record.price ? `$${Number(record.price).toFixed(2)}` : ''
          const recordImage = getAbsoluteImageUrl(record.image_url)
          const recordUrl = record.id
            ? `${baseUrl}/product/${encodeURIComponent(String(record.id))}`
            : `${baseUrl}/catalog`
          const recordCategory = escapeHtml(record.category || '')
          const isNewCategory = recordCategory.toLowerCase().includes('new')
          
          return `
            <td style="width: 16.66%; padding: 0 6px; vertical-align: top;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                <tr>
                  <td style="background-color: ${BRAND.cream};">
                    <a href="${recordUrl}" style="text-decoration: none; display: block;">
                      <!-- Image Container (square, matches website retro mode: no border-radius, 2px black border) -->
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-bottom: 16px;">
                        <tr>
                          <td style="position: relative; padding: 0; background-color: ${BRAND.white}; border: 2px solid ${BRAND.black};">
                            <img src="${recordImage}" alt="${title}" width="100%" style="display: block; width: 100%; height: auto; border: 0; outline: none; text-decoration: none;" />
                            ${recordCategory ? `
                              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="position: absolute; top: 8px; ${isNewCategory ? 'left: 8px;' : 'right: 8px;'}">
                                <tr>
                                  <td style="background-color: ${isNewCategory ? BRAND.orange : BRAND.cream}; color: ${BRAND.black}; padding: 4px 8px; border: 2px solid ${BRAND.black}; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; line-height: 1.2; font-family: 'Inter', system-ui, sans-serif;">
                                    ${recordCategory}
                                  </td>
                                </tr>
                              </table>
                            ` : ''}
                          </td>
                        </tr>
                      </table>
                      <!-- Product Info (matches website structure) -->
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                        <tr>
                          <td style="padding: 0 0 8px 0;">
                            <h3 style="margin: 0 0 4px 0; color: ${BRAND.black}; font-size: 14px; font-weight: 700; line-height: 1.3; font-family: 'Inter', system-ui, sans-serif;">
                              ${title}
                            </h3>
                            ${artist ? `<p style="margin: 0 0 8px 0; color: ${BRAND.black}; opacity: 0.6; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; font-family: 'Inter', system-ui, sans-serif;">${artist}</p>` : ''}
                            <!-- Footer with Price (matches website) -->
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-top: 8px; padding-top: 12px; border-top: 1px solid rgba(35, 31, 32, 0.1);">
                              <tr>
                                <td style="padding-top: 12px; border-top: 1px solid rgba(35, 31, 32, 0.1);">
                                  ${recordPrice ? `<span style="color: ${BRAND.black}; font-size: 18px; font-weight: 900; font-family: 'Inter', system-ui, sans-serif; letter-spacing: 0.02em;">${recordPrice}</span>` : ''}
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          `
        }).join('')}
      </tr>
    </table>
    ${renderButton({ href: `${baseUrl}/catalog`, label: 'Shop your recommendations', tone: 'orange' })}
  ` : ''

  const bodyHtml = `
    <div class="sg-mobile-hero" style="margin: 0 0 18px 0; padding: 18px 16px; background: ${BRAND.white}; border: 2px solid ${BRAND.black}; border-radius: 12px; box-shadow: 4px 4px 0px 0px ${BRAND.black};">
      <h2 style="margin: 0 0 10px 0; font-family: Shrikhand, cursive; color: ${BRAND.black}; font-size: 32px; line-height: 1.15; letter-spacing: 0.02em;">
        Hey <span class="sg-accent" style="color:${BRAND.orange};">${escapeHtml(name)}</span> 👋
      </h2>
      <p style="margin: 0; color: ${BRAND.black}; font-size: 16px; line-height: 1.7; font-weight: 600;">
        Here's what's happening this week at Spiral Groove Records.
      </p>
    </div>

    ${eventsHtml}
    ${newRecordsHtml}
    ${recommendationsHtml}

    <div style="margin-top: 28px; padding: 18px; background-color: ${BRAND.mustard}; border: 2px solid ${BRAND.black}; border-radius: 12px; box-shadow: 4px 4px 0px 0px ${BRAND.black};">
      <p style="margin: 0; color: ${BRAND.black}; font-size: 14px; line-height: 1.6; font-weight: 700;">
        <strong>Store Hours:</strong> Monday-Saturday 10am-8pm, Sunday 12pm-6pm<br>
        <strong>Location:</strong> 215B Main Street, Milford, OH 45150
      </p>
    </div>

    <p style="margin: 24px 0 0 0; color: ${BRAND.gray600}; font-size: 12px; line-height: 1.6; font-weight: 600; text-align:center;">
      ${unsubscribeUrl ? `Want fewer emails? <a href="${unsubscribeUrl}" style="color:${BRAND.teal}; font-weight: 800; text-decoration:none;">Unsubscribe</a>.` : 'Want fewer emails? Reply to this email and ask to unsubscribe.'}
    </p>
  `.trim()

  return renderLayout({
    title: 'This Week at Spiral Groove Records',
    preheader: 'Upcoming events, new arrivals, and picks just for you.',
    bodyHtml,
  })
}

/**
 * Internal sale alert email HTML
 */
export function generateSaleAlertEmail(data) {
  // Use the same internal "admin card" style as the Contact Inquiry template.
  const baseUrl = getBaseUrl()
  const {
    orderNumber,
    squareOrderId,
    squarePaymentId,
    total,
    currency = 'USD',
    customerEmail,
    customerName,
    items = [],
  } = data || {}

  const squareOrderUrl = getSquareOrderDashboardUrl(squareOrderId)
  const squarePaymentUrl = getSquarePaymentDashboardUrl(squarePaymentId)
  const siteOrderUrl = `${baseUrl}/order-status?order=${encodeURIComponent(orderNumber || '')}&email=${encodeURIComponent(customerEmail || '')}`

  const currencySymbol = currency === 'USD' ? '$' : ''
  const formattedTotal =
    total != null && total !== '' && Number.isFinite(Number(total))
      ? `${currencySymbol}${Number(total).toFixed(2)}`
      : ''

  const whatSummary =
    Array.isArray(items) && items.length > 0
      ? items
          .slice(0, 4)
          .map((it) => {
            const name = String(it?.name || '').trim() || 'Item'
            const qty = Number(it?.quantity || 1)
            const q = Number.isFinite(qty) && qty > 1 ? `${qty}× ` : ''
            return `${q}${name}`
          })
          .join(', ') + (items.length > 4 ? ` (+${items.length - 4} more)` : '')
      : ''

  const safe = {
    orderNumber: escapeHtml(orderNumber || ''),
    total: escapeHtml(formattedTotal || ''),
    what: escapeHtml(whatSummary || ''),
    customerName: escapeHtml(customerName || ''),
    customerEmail: escapeHtml(customerEmail || ''),
    squareOrderId: escapeHtml(squareOrderId || ''),
    squarePaymentId: escapeHtml(squarePaymentId || ''),
    squareOrderUrl: squareOrderUrl ? escapeHtml(squareOrderUrl) : '',
    squarePaymentUrl: squarePaymentUrl ? escapeHtml(squarePaymentUrl) : '',
    siteOrderUrl: escapeHtml(siteOrderUrl),
  }

  const itemsLines =
    Array.isArray(items) && items.length > 0
      ? items
          .slice(0, 12)
          .map((it) => {
            const name = escapeHtml(String(it?.name || 'Item'))
            const qty = escapeHtml(String(it?.quantity || 1))
            const price = typeof it?.price === 'number' ? it.price : Number(it?.price || 0)
            const priceTxt = `${currencySymbol}${Number.isFinite(price) ? price.toFixed(2) : '0.00'}`
            return `${qty}× ${name} — ${escapeHtml(priceTxt)}`
          })
          .join('<br/>')
      : ''

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Spiral Groove — New Order</title>
    <style>
      :root { color-scheme: light; }
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; background:#f7f4ef; color:#111; margin:0; padding:32px; }
      .card { max-width: 760px; margin: 0 auto; background:#fff; border:2px solid #111; box-shadow: 8px 8px 0 #111; }
      .header { padding: 18px 20px; border-bottom:2px solid #111; background:#f1b23e; font-weight:900; letter-spacing:.08em; text-transform:uppercase; }
      .content { padding: 20px; }
      .row { display:flex; gap:16px; padding:10px 0; border-bottom:1px dashed #ddd; }
      .row:last-child { border-bottom:0; }
      .k { width: 160px; flex-shrink:0; font-weight:800; text-transform:uppercase; font-size:12px; opacity:.75; letter-spacing:.08em; }
      .v { flex:1; font-size:14px; line-height:1.5; word-break:break-word; }
      .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
      a { color:#0b5fff; text-decoration:none; }
      a:hover { text-decoration:underline; }
      .ok { display:inline-block; margin: 0 0 14px 0; padding: 6px 10px; border:2px solid #111; background:#12b981; color:#111; font-weight:900; text-transform:uppercase; font-size:12px; letter-spacing:.08em; }
      .actions { display:flex; flex-wrap:wrap; gap:10px; margin: 6px 0 14px 0; }
      .btn { display:inline-block; padding:10px 14px; border:2px solid #111; background:#111; color:#fff !important; font-weight:900; text-transform:uppercase; font-size:12px; letter-spacing:.08em; }
      .btn:hover { opacity:.9; text-decoration:none; }
      .btn.secondary { background:#fff; color:#111 !important; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="header">New Order Received</div>
      <div class="content">
        <div class="ok">Paid</div>
        <div class="actions">
          ${safe.squareOrderUrl ? `<a class="btn" href="${safe.squareOrderUrl}" target="_blank" rel="noreferrer">View in Square</a>` : ''}
          ${!safe.squareOrderUrl && safe.squarePaymentUrl ? `<a class="btn" href="${safe.squarePaymentUrl}" target="_blank" rel="noreferrer">View payment</a>` : ''}
          <a class="btn secondary" href="${safe.siteOrderUrl}" target="_blank" rel="noreferrer">View status page</a>
        </div>

        <div class="row"><div class="k">What</div><div class="v">${safe.what || '<span style="opacity:.6">—</span>'}</div></div>
        <div class="row"><div class="k">Customer</div><div class="v">${(safe.customerName || safe.customerEmail) ? `${safe.customerName ? `${safe.customerName} • ` : ''}${safe.customerEmail}` : '<span style="opacity:.6">—</span>'}</div></div>
        <div class="row"><div class="k">Order #</div><div class="v">${safe.orderNumber || '<span style="opacity:.6">—</span>'}</div></div>
        <div class="row"><div class="k">Total</div><div class="v">${safe.total || '<span style="opacity:.6">—</span>'}</div></div>
        ${itemsLines ? `<div class="row"><div class="k">Items</div><div class="v">${itemsLines}</div></div>` : ''}
        <div class="row"><div class="k">Meta</div><div class="v mono">squareOrderId=${safe.squareOrderId || '—'}<br/>squarePaymentId=${safe.squarePaymentId || '—'}</div></div>
      </div>
    </div>
  </body>
</html>`
}

/**
 * Generate error alert email HTML
 */
export function generateAlertEmail(data) {
  const {
    statusCode,
    error,
    endpoint,
    method = 'GET',
    severity = 'warning',
    timestamp,
    requestId,
    ip,
    userAgent,
    stack,
    responseTime,
    queryDuration,
    errorSpike,
    context = {},
    recoverySuggestions = [],
    geminiPrompt,
  } = data

  const baseUrl = getBaseUrl()
  const emoji = severity === 'critical' ? '🚨' : severity === 'warning' ? '⚠️' : 'ℹ️'
  const severityColor = severity === 'critical' ? BRAND.red : severity === 'warning' ? BRAND.mustard : BRAND.teal
  const statusColor = statusCode >= 500 ? BRAND.red : statusCode >= 400 ? BRAND.mustard : BRAND.teal

  const detailsHtml = `
    <div style="margin: 18px 0; padding: 18px; background-color: ${BRAND.white}; border: 2px solid ${BRAND.black}; border-radius: 12px; box-shadow: 4px 4px 0px 0px ${BRAND.black};">
      <p style="margin: 0 0 12px 0; font-size: 12px; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase; color: ${BRAND.gray600};">
        Error Details
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
        <tr>
          <td style="padding: 6px 0; color: ${BRAND.black}; font-size: 14px; font-weight: 700;">Status Code:</td>
          <td style="padding: 6px 0; color: ${statusColor}; font-size: 14px; font-weight: 800;">${statusCode}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: ${BRAND.black}; font-size: 14px; font-weight: 700;">Severity:</td>
          <td style="padding: 6px 0; color: ${severityColor}; font-size: 14px; font-weight: 800; text-transform: uppercase;">${severity}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: ${BRAND.black}; font-size: 14px; font-weight: 700;">Endpoint:</td>
          <td style="padding: 6px 0; color: ${BRAND.black}; font-size: 14px; font-weight: 600;">${escapeHtml(method)} ${escapeHtml(endpoint || 'unknown')}</td>
        </tr>
        ${requestId ? `
        <tr>
          <td style="padding: 6px 0; color: ${BRAND.black}; font-size: 14px; font-weight: 700;">Request ID:</td>
          <td style="padding: 6px 0; color: ${BRAND.gray600}; font-size: 12px; font-weight: 600; font-family: monospace;">${escapeHtml(requestId)}</td>
        </tr>
        ` : ''}
        ${ip ? `
        <tr>
          <td style="padding: 6px 0; color: ${BRAND.black}; font-size: 14px; font-weight: 700;">IP Address:</td>
          <td style="padding: 6px 0; color: ${BRAND.gray600}; font-size: 12px; font-weight: 600;">${escapeHtml(ip)}</td>
        </tr>
        ` : ''}
        ${responseTime ? `
        <tr>
          <td style="padding: 6px 0; color: ${BRAND.black}; font-size: 14px; font-weight: 700;">Response Time:</td>
          <td style="padding: 6px 0; color: ${responseTime > 2000 ? BRAND.red : BRAND.gray600}; font-size: 14px; font-weight: 700;">${responseTime}ms ${responseTime > 2000 ? '⚠️ SLOW' : ''}</td>
        </tr>
        ` : ''}
        ${queryDuration ? `
        <tr>
          <td style="padding: 6px 0; color: ${BRAND.black}; font-size: 14px; font-weight: 700;">Query Duration:</td>
          <td style="padding: 6px 0; color: ${queryDuration > 500 ? BRAND.red : BRAND.gray600}; font-size: 14px; font-weight: 700;">${queryDuration}ms ${queryDuration > 500 ? '⚠️ SLOW' : ''}</td>
        </tr>
        ` : ''}
        ${errorSpike ? `
        <tr>
          <td colspan="2" style="padding: 12px 0 6px 0; color: ${BRAND.red}; font-size: 14px; font-weight: 800;">
            ⚠️ ERROR SPIKE: ${errorSpike.count} occurrences in last ${Math.round(errorSpike.windowMs / 1000 / 60)} minutes
          </td>
        </tr>
        ` : ''}
      </table>
    </div>
  `

  const errorMessageHtml = `
    <div style="margin: 18px 0; padding: 18px; background-color: ${BRAND.white}; border: 2px solid ${BRAND.black}; border-radius: 12px; box-shadow: 4px 4px 0px 0px ${BRAND.black};">
      <p style="margin: 0 0 12px 0; font-size: 12px; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase; color: ${BRAND.gray600};">
        Error Message
      </p>
      <p style="margin: 0; color: ${BRAND.black}; font-size: 14px; line-height: 1.6; font-weight: 600; font-family: monospace; word-break: break-word;">
        ${escapeHtml(error || 'Unknown error')}
      </p>
    </div>
  `

  const stackTraceHtml = stack ? `
    <div style="margin: 18px 0; padding: 18px; background-color: ${BRAND.white}; border: 2px solid ${BRAND.black}; border-radius: 12px; box-shadow: 4px 4px 0px 0px ${BRAND.black};">
      <p style="margin: 0 0 12px 0; font-size: 12px; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase; color: ${BRAND.gray600};">
        Stack Trace
      </p>
      <pre style="margin: 0; padding: 12px; background-color: ${BRAND.cream}; border: 1px solid ${BRAND.gray200}; border-radius: 8px; color: ${BRAND.black}; font-size: 11px; line-height: 1.5; font-family: monospace; white-space: pre-wrap; word-break: break-word; overflow-x: auto;">${escapeHtml(stack)}</pre>
    </div>
  ` : ''

  const contextHtml = Object.keys(context).length > 0 ? `
    <div style="margin: 18px 0; padding: 18px; background-color: ${BRAND.white}; border: 2px solid ${BRAND.black}; border-radius: 12px; box-shadow: 4px 4px 0px 0px ${BRAND.black};">
      <p style="margin: 0 0 12px 0; font-size: 12px; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase; color: ${BRAND.gray600};">
        Additional Context
      </p>
      <pre style="margin: 0; padding: 12px; background-color: ${BRAND.cream}; border: 1px solid ${BRAND.gray200}; border-radius: 8px; color: ${BRAND.black}; font-size: 11px; line-height: 1.5; font-family: monospace; white-space: pre-wrap; word-break: break-word; overflow-x: auto;">${escapeHtml(JSON.stringify(context, null, 2))}</pre>
    </div>
  ` : ''

  const suggestionsHtml = recoverySuggestions.length > 0 ? `
    <div style="margin: 18px 0; padding: 18px; background-color: ${BRAND.mustard}; border: 2px solid ${BRAND.black}; border-radius: 12px; box-shadow: 4px 4px 0px 0px ${BRAND.black};">
      <p style="margin: 0 0 12px 0; font-size: 12px; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase; color: ${BRAND.black};">
        Recovery Suggestions
      </p>
      <ul style="margin: 0; padding-left: 18px; color: ${BRAND.black}; font-size: 14px; line-height: 1.8; font-weight: 600;">
        ${recoverySuggestions.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
      </ul>
    </div>
  ` : ''

  const bodyHtml = `
    <h2 style="margin: 0 0 14px 0; font-family: Shrikhand, cursive; color: ${BRAND.black}; font-size: 32px; line-height: 1.15; letter-spacing: 0.02em;">
      ${emoji} API Alert
    </h2>
    <p style="margin: 0 0 18px 0; color: ${BRAND.black}; font-size: 16px; line-height: 1.7; font-weight: 600;">
      An error was detected in your application${timestamp ? ` at ${new Date(timestamp).toLocaleString()}` : ''}.
    </p>

    ${detailsHtml}
    ${errorMessageHtml}
    ${stackTraceHtml}
    ${contextHtml}
    ${suggestionsHtml}

    ${userAgent ? `
    <div style="margin: 18px 0; padding: 12px; background-color: ${BRAND.gray200}; border-radius: 8px;">
      <p style="margin: 0; color: ${BRAND.gray600}; font-size: 11px; line-height: 1.5; font-weight: 600; word-break: break-word;">
        <strong>User Agent:</strong> ${escapeHtml(userAgent.substring(0, 200))}
      </p>
    </div>
    ` : ''}
  `.trim()

  return renderLayout({
    title: `${emoji} API Error Alert: ${statusCode}`,
    preheader: `${method} ${endpoint} - ${error?.substring(0, 60) || 'Error detected'}`,
    bodyHtml,
  })
}
