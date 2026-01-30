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
  orange: '#F35B04',
  teal: '#00C2CB',
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

function getContactEmail() {
  return process.env.CONTACT_EMAIL || 'adam@spiralgrooverecords.com'
}

function escapeHtml(value) {
  return String(value ?? '')
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
</head>
<body style="margin: 0; padding: 0; font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; background-color: ${BRAND.cream};">
  <div style="display:none; font-size:1px; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">
    ${escapeHtml(preheader || '')}
  </div>

  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: ${BRAND.cream};">
    <tr>
      <td style="padding: 0;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; max-width: 680px; margin: 0 auto; background-color: ${BRAND.black}; border-bottom: 4px solid ${BRAND.orange};">
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
        <table role="presentation" style="width: 100%; border-collapse: collapse; max-width: 680px; margin: 0 auto; background-color: ${BRAND.cream};">
          <tr>
            <td style="padding: 0; background-color: ${BRAND.cream};">
              <div style="margin: 0 14px; border: 2px solid ${BRAND.black}; box-shadow: 8px 8px 0px 0px ${BRAND.black}; background: ${BRAND.cream};">
                <div style="padding: 34px 22px 28px 22px; background-color: ${BRAND.cream};
                  background-image:
                    linear-gradient(${BRAND.black}10 1px, transparent 1px),
                    linear-gradient(90deg, ${BRAND.black}10 1px, transparent 1px);
                  background-size: 26px 26px;
                  background-position: -1px -1px;">
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
        <table role="presentation" style="width: 100%; border-collapse: collapse; max-width: 680px; margin: 0 auto; background-color: ${BRAND.black}; border-top: 4px solid ${BRAND.orange};">
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

    ${renderButton({ href: reviewUrl, label: 'Leave a review', tone: 'teal' })}

    <div style="margin-top: 18px;">
      ${renderButton({
        href: `${baseUrl}/catalog`,
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
