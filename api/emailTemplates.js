/**
 * Email HTML Templates
 * Generates HTML email content for each email type
 * Matches the Spiral Groove Records website design
 */

/**
 * Generate newsletter signup welcome email HTML
 */
export function generateNewsletterEmail(data) {
  const { firstName, lastName, email } = data
  const name = firstName ? `${firstName} ${lastName || ''}`.trim() : email.split('@')[0]
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Spiral Groove Records Newsletter</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@600;700;800&family=Shrikhand&family=Gloria+Hallelujah&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', sans-serif; background-color: #FFF9F0;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #FFF9F0;">
    <tr>
      <td style="padding: 0;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; max-width: 600px; margin: 0 auto; background-color: #231F20; border-bottom: 4px solid #FF2E63;">
          <tr>
            <td style="padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; font-family: 'Shrikhand', cursive; color: #FFFFFF; font-size: 36px; line-height: 1.1; letter-spacing: 0.02em;">
                SPIRAL<span style="color: #00C2CB;">GROOVE</span>
              </h1>
              <p style="margin: 5px 0 0 0; color: #FF2E63; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.3em;">Records</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 0;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; max-width: 600px; margin: 0 auto; background-color: #FFF9F0;">
          <tr>
            <td style="padding: 50px 30px; background-color: #FFF9F0;">
              <h2 style="margin: 0 0 20px 0; font-family: 'Shrikhand', cursive; color: #231F20; font-size: 32px; line-height: 1.2; letter-spacing: 0.02em;">
                Welcome to the <span style="color: #00C2CB;">Groove</span>, ${name}!
              </h2>
              <p style="margin: 0 0 20px 0; color: #231F20; font-size: 16px; line-height: 1.7; font-weight: 500;">
                Thanks for joining our newsletter! You're now part of an exclusive community of music lovers, collectors, and vinyl enthusiasts.
              </p>
              <p style="margin: 0 0 20px 0; color: #231F20; font-size: 16px; line-height: 1.7; font-weight: 500;">
                Get ready for:
              </p>
              <ul style="margin: 0 0 30px 0; padding-left: 20px; color: #231F20; font-size: 16px; line-height: 2;">
                <li style="margin-bottom: 8px;">Exclusive deals and new arrivals</li>
                <li style="margin-bottom: 8px;">Artist spotlights and featured releases</li>
                <li style="margin-bottom: 8px;">Store events and special promotions</li>
                <li style="margin-bottom: 8px;">Vinyl collecting tips and music news</li>
              </ul>
              <p style="margin: 0 0 40px 0; color: #231F20; font-size: 16px; line-height: 1.7; font-weight: 500;">
                We're excited to share our passion for music with you. Stay tuned for your first newsletter!
              </p>
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://spiralgrooverecords.com/catalog" style="display: inline-block; padding: 16px 32px; background-color: #00C2CB; color: #231F20; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; box-shadow: 4px 4px 0px 0px #231F20; transition: all 0.2s;">Browse Our Catalog</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 0;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; max-width: 600px; margin: 0 auto; background-color: #231F20; border-top: 4px solid #FF2E63;">
          <tr>
            <td style="padding: 30px 20px; text-align: center; color: #FFF9F0; font-size: 12px;">
              <p style="margin: 0 0 8px 0; font-weight: 600;">Spiral Groove Records</p>
              <p style="margin: 0 0 8px 0; color: #999999;">215B Main Street, Milford, OH 45150</p>
              <p style="margin: 15px 0 0 0;">
                <a href="https://spiralgrooverecords.com" style="color: #00C2CB; text-decoration: none; font-weight: 600; margin: 0 10px;">Visit our website</a>
                <span style="color: #666666;">|</span>
                <a href="mailto:info@spiralgrooverecords.com" style="color: #00C2CB; text-decoration: none; font-weight: 600; margin: 0 10px;">Contact us</a>
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
 * Generate user signup welcome email HTML
 */
export function generateSignupEmail(data) {
  const { name, email } = data
  const displayName = name || email.split('@')[0]
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Spiral Groove Records</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@600;700;800&family=Shrikhand&family=Gloria+Hallelujah&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', sans-serif; background-color: #FFF9F0;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #FFF9F0;">
    <tr>
      <td style="padding: 0;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; max-width: 600px; margin: 0 auto; background-color: #231F20; border-bottom: 4px solid #FF2E63;">
          <tr>
            <td style="padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; font-family: 'Shrikhand', cursive; color: #FFFFFF; font-size: 36px; line-height: 1.1; letter-spacing: 0.02em;">
                SPIRAL<span style="color: #00C2CB;">GROOVE</span>
              </h1>
              <p style="margin: 5px 0 0 0; color: #FF2E63; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.3em;">Records</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 0;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; max-width: 600px; margin: 0 auto; background-color: #FFF9F0;">
          <tr>
            <td style="padding: 50px 30px; background-color: #FFF9F0;">
              <h2 style="margin: 0 0 20px 0; font-family: 'Shrikhand', cursive; color: #231F20; font-size: 32px; line-height: 1.2; letter-spacing: 0.02em;">
                Welcome, <span style="color: #00C2CB;">${displayName}</span>!
              </h2>
              <p style="margin: 0 0 20px 0; color: #231F20; font-size: 16px; line-height: 1.7; font-weight: 500;">
                Your account has been created successfully. You're all set to start shopping!
              </p>
              <p style="margin: 0 0 20px 0; color: #231F20; font-size: 16px; line-height: 1.7; font-weight: 500;">
                With your account, you can:
              </p>
              <ul style="margin: 0 0 30px 0; padding-left: 20px; color: #231F20; font-size: 16px; line-height: 2;">
                <li style="margin-bottom: 8px;">Save your shipping information for faster checkout</li>
                <li style="margin-bottom: 8px;">Track all your orders in one place</li>
                <li style="margin-bottom: 8px;">Save favorite items to your wishlist</li>
                <li style="margin-bottom: 8px;">Get exclusive offers and updates</li>
              </ul>
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://spiralgrooverecords.com/catalog" style="display: inline-block; padding: 16px 32px; background-color: #00C2CB; color: #231F20; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; box-shadow: 4px 4px 0px 0px #231F20;">Start Shopping</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 0;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; max-width: 600px; margin: 0 auto; background-color: #231F20; border-top: 4px solid #FF2E63;">
          <tr>
            <td style="padding: 30px 20px; text-align: center; color: #FFF9F0; font-size: 12px;">
              <p style="margin: 0 0 8px 0; font-weight: 600;">Spiral Groove Records</p>
              <p style="margin: 0 0 8px 0; color: #999999;">215B Main Street, Milford, OH 45150</p>
              <p style="margin: 15px 0 0 0;">
                <a href="https://spiralgrooverecords.com" style="color: #00C2CB; text-decoration: none; font-weight: 600; margin: 0 10px;">Visit our website</a>
                <span style="color: #666666;">|</span>
                <a href="mailto:info@spiralgrooverecords.com" style="color: #00C2CB; text-decoration: none; font-weight: 600; margin: 0 10px;">Contact us</a>
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
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation ${orderNumber}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@600;700;800&family=Shrikhand&family=Gloria+Hallelujah&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', sans-serif; background-color: #FFF9F0;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #FFF9F0;">
    <tr>
      <td style="padding: 0;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; max-width: 600px; margin: 0 auto; background-color: #231F20; border-bottom: 4px solid #FF2E63;">
          <tr>
            <td style="padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; font-family: 'Shrikhand', cursive; color: #FFFFFF; font-size: 36px; line-height: 1.1; letter-spacing: 0.02em;">
                SPIRAL<span style="color: #00C2CB;">GROOVE</span>
              </h1>
              <p style="margin: 5px 0 0 0; color: #FF2E63; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.3em;">Records</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 0;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; max-width: 600px; margin: 0 auto; background-color: #FFF9F0;">
          <tr>
            <td style="padding: 50px 30px; background-color: #FFF9F0;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; width: 70px; height: 70px; background-color: #3AB795; border-radius: 50%; line-height: 70px; text-align: center; font-size: 40px; color: #FFF9F0; font-weight: bold; box-shadow: 4px 4px 0px 0px #231F20;">✓</div>
              </div>
              <h2 style="margin: 0 0 15px 0; font-family: 'Shrikhand', cursive; color: #231F20; font-size: 36px; text-align: center; letter-spacing: 0.02em;">Order Confirmed!</h2>
              <p style="margin: 0 0 40px 0; color: #231F20; font-size: 16px; text-align: center; font-weight: 500;">Thank you for your order, ${customerName || 'Valued Customer'}!</p>
              
              <div style="background-color: #231F20; padding: 25px; border-radius: 8px; margin-bottom: 30px; box-shadow: 4px 4px 0px 0px #00C2CB;">
                <p style="margin: 0 0 10px 0; color: #FFF9F0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">Order Number</p>
                <p style="margin: 0; color: #00C2CB; font-size: 28px; font-weight: bold; font-family: 'Shrikhand', cursive;">${orderNumber}</p>
              </div>
              
              <h3 style="margin: 0 0 20px 0; font-family: 'Shrikhand', cursive; color: #231F20; font-size: 24px; letter-spacing: 0.02em;">Order Details</h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; background-color: #FFF9F0; border: 2px solid #231F20; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #231F20;">
                    <th style="padding: 14px 12px; text-align: left; color: #FFF9F0; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Item</th>
                    <th style="padding: 14px 12px; text-align: center; color: #FFF9F0; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Qty</th>
                    <th style="padding: 14px 12px; text-align: right; color: #FFF9F0; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Price</th>
                    <th style="padding: 14px 12px; text-align: right; color: #FFF9F0; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              
              <div style="text-align: right; margin-bottom: 30px; padding: 20px; background-color: #FFF9F0; border: 2px solid #231F20; border-radius: 8px;">
                <p style="margin: 0; color: #231F20; font-size: 18px; font-weight: 600;">
                  Total: <span style="color: #00C2CB; font-size: 32px; font-weight: bold; font-family: 'Shrikhand', cursive;">${formattedTotal}</span>
                </p>
              </div>
              
              <div style="background-color: #FFF9F0; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 2px solid #231F20;">
                <p style="margin: 0 0 10px 0; color: #231F20; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">${deliveryMethod === 'pickup' ? 'Pickup Location' : 'Shipping Address'}</p>
                <p style="margin: 0; color: #231F20; font-size: 16px; line-height: 1.6; font-weight: 500;">
                  ${deliveryMethod === 'pickup' 
                    ? (pickupLocation || '215B Main Street, Milford, OH 45150')
                    : 'Your order will be shipped to the address provided during checkout.'}
                </p>
              </div>
              
              ${deliveryMethod === 'pickup' ? `
              <div style="background-color: #F9D776; padding: 20px; border-radius: 8px; border: 2px solid #231F20; margin-bottom: 30px; box-shadow: 4px 4px 0px 0px #231F20;">
                <p style="margin: 0; color: #231F20; font-size: 14px; line-height: 1.6; font-weight: 600;">
                  <strong>Pickup Instructions:</strong> We'll notify you when your order is ready for pickup. Please bring a valid ID when you arrive.
                </p>
              </div>
              ` : ''}
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://spiralgrooverecords.com/order-status?order=${orderNumber}&email=${encodeURIComponent(customerEmail)}" style="display: inline-block; padding: 16px 32px; background-color: #00C2CB; color: #231F20; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; box-shadow: 4px 4px 0px 0px #231F20;">Track Your Order</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 0;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; max-width: 600px; margin: 0 auto; background-color: #231F20; border-top: 4px solid #FF2E63;">
          <tr>
            <td style="padding: 30px 20px; text-align: center; color: #FFF9F0; font-size: 12px;">
              <p style="margin: 0 0 8px 0; font-weight: 600;">Spiral Groove Records</p>
              <p style="margin: 0 0 8px 0; color: #999999;">215B Main Street, Milford, OH 45150</p>
              <p style="margin: 15px 0 0 0;">
                <a href="https://spiralgrooverecords.com" style="color: #00C2CB; text-decoration: none; font-weight: 600; margin: 0 10px;">Visit our website</a>
                <span style="color: #666666;">|</span>
                <a href="mailto:info@spiralgrooverecords.com" style="color: #00C2CB; text-decoration: none; font-weight: 600; margin: 0 10px;">Contact us</a>
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
 * Generate forgot password reset email HTML
 */
export function generateForgotPasswordEmail(data) {
  const { email, resetUrl, expiresIn = '1 hour' } = data
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@600;700;800&family=Shrikhand&family=Gloria+Hallelujah&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', sans-serif; background-color: #FFF9F0;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #FFF9F0;">
    <tr>
      <td style="padding: 0;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; max-width: 600px; margin: 0 auto; background-color: #231F20; border-bottom: 4px solid #FF2E63;">
          <tr>
            <td style="padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; font-family: 'Shrikhand', cursive; color: #FFFFFF; font-size: 36px; line-height: 1.1; letter-spacing: 0.02em;">
                SPIRAL<span style="color: #00C2CB;">GROOVE</span>
              </h1>
              <p style="margin: 5px 0 0 0; color: #FF2E63; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.3em;">Records</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 0;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; max-width: 600px; margin: 0 auto; background-color: #FFF9F0;">
          <tr>
            <td style="padding: 50px 30px; background-color: #FFF9F0;">
              <h2 style="margin: 0 0 20px 0; font-family: 'Shrikhand', cursive; color: #231F20; font-size: 32px; line-height: 1.2; letter-spacing: 0.02em;">Reset Your Password</h2>
              <p style="margin: 0 0 20px 0; color: #231F20; font-size: 16px; line-height: 1.7; font-weight: 500;">
                We received a request to reset your password for your Spiral Groove Records account (<strong>${email}</strong>).
              </p>
              <p style="margin: 0 0 40px 0; color: #231F20; font-size: 16px; line-height: 1.7; font-weight: 500;">
                Click the button below to create a new password. This link will expire in <strong>${expiresIn}</strong>.
              </p>
              <div style="text-align: center; margin: 40px 0;">
                <a href="${resetUrl}" style="display: inline-block; padding: 16px 32px; background-color: #00C2CB; color: #231F20; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; box-shadow: 4px 4px 0px 0px #231F20;">Reset Password</a>
              </div>
              <p style="margin: 40px 0 15px 0; color: #231F20; font-size: 14px; line-height: 1.6; font-weight: 500;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 30px 0; padding: 15px; background-color: #FFF9F0; border: 2px solid #231F20; border-radius: 8px; word-break: break-all; color: #231F20; font-size: 11px; font-family: monospace; line-height: 1.6;">
                ${resetUrl}
              </p>
              <div style="background-color: #F9D776; padding: 20px; border-radius: 8px; border: 2px solid #231F20; margin-bottom: 20px; box-shadow: 4px 4px 0px 0px #231F20;">
                <p style="margin: 0; color: #231F20; font-size: 14px; line-height: 1.6; font-weight: 600;">
                  <strong>Security Notice:</strong> If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
                </p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 0;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; max-width: 600px; margin: 0 auto; background-color: #231F20; border-top: 4px solid #FF2E63;">
          <tr>
            <td style="padding: 30px 20px; text-align: center; color: #FFF9F0; font-size: 12px;">
              <p style="margin: 0 0 8px 0; font-weight: 600;">Spiral Groove Records</p>
              <p style="margin: 0 0 8px 0; color: #999999;">215B Main Street, Milford, OH 45150</p>
              <p style="margin: 15px 0 0 0;">
                <a href="https://spiralgrooverecords.com" style="color: #00C2CB; text-decoration: none; font-weight: 600; margin: 0 10px;">Visit our website</a>
                <span style="color: #666666;">|</span>
                <a href="mailto:info@spiralgrooverecords.com" style="color: #00C2CB; text-decoration: none; font-weight: 600; margin: 0 10px;">Contact us</a>
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
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Status Update ${orderNumber}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@600;700;800&family=Shrikhand&family=Gloria+Hallelujah&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', sans-serif; background-color: #FFF9F0;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #FFF9F0;">
    <tr>
      <td style="padding: 0;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; max-width: 600px; margin: 0 auto; background-color: #231F20; border-bottom: 4px solid #FF2E63;">
          <tr>
            <td style="padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; font-family: 'Montserrat', sans-serif; color: #FFFFFF; font-size: 36px; line-height: 1.1; letter-spacing: 0.02em; font-weight: 800;">
                SPIRAL<span style="color: #00C2CB;">GROOVE</span>
              </h1>
              <p style="margin: 5px 0 0 0; color: #FF2E63; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.3em; font-family: 'Montserrat', sans-serif;">Records</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 0;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; max-width: 600px; margin: 0 auto; background-color: #FFF9F0;">
          <tr>
            <td style="padding: 50px 30px; background-color: #FFF9F0;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; width: 70px; height: 70px; background-color: ${statusInfo.color}; border-radius: 50%; line-height: 70px; text-align: center; font-size: 40px; color: #FFF9F0; font-weight: bold; box-shadow: 4px 4px 0px 0px #231F20;">${statusInfo.icon}</div>
              </div>
              <h2 style="margin: 0 0 15px 0; font-family: 'Montserrat', sans-serif; color: #231F20; font-size: 32px; text-align: center; letter-spacing: 0.02em; font-weight: 700;">${statusInfo.title}</h2>
              <p style="margin: 0 0 30px 0; color: #231F20; font-size: 16px; text-align: center; font-weight: 500; font-family: 'Inter', sans-serif;">${statusMessage || statusInfo.message}</p>
              
              <div style="background-color: #231F20; padding: 25px; border-radius: 8px; margin-bottom: 30px; box-shadow: 4px 4px 0px 0px ${statusInfo.color};">
                <p style="margin: 0 0 10px 0; color: #FFF9F0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; font-family: 'Montserrat', sans-serif;">Order Number</p>
                <p style="margin: 0; color: #00C2CB; font-size: 28px; font-weight: 700; font-family: 'Montserrat', sans-serif;">${orderNumber}</p>
              </div>
              
              ${items.length > 0 ? `
              <h3 style="margin: 0 0 20px 0; font-family: 'Montserrat', sans-serif; color: #231F20; font-size: 24px; letter-spacing: 0.02em; font-weight: 700;">Order Items</h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; background-color: #FFF9F0; border: 2px solid #231F20; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #231F20;">
                    <th style="padding: 14px 12px; text-align: left; color: #FFF9F0; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Item</th>
                    <th style="padding: 14px 12px; text-align: center; color: #FFF9F0; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Qty</th>
                    <th style="padding: 14px 12px; text-align: right; color: #FFF9F0; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              ` : ''}
              
              ${total ? `
              <div style="text-align: right; margin-bottom: 30px; padding: 20px; background-color: #FFF9F0; border: 2px solid #231F20; border-radius: 8px;">
                <p style="margin: 0; color: #231F20; font-size: 18px; font-weight: 600; font-family: 'Inter', sans-serif;">
                  Total: <span style="color: #00C2CB; font-size: 32px; font-weight: 700; font-family: 'Montserrat', sans-serif;">${formattedTotal}</span>
                </p>
              </div>
              ` : ''}
              
              ${deliveryMethod === 'pickup' && pickupLocation ? `
              <div style="background-color: #FFF9F0; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 2px solid #231F20;">
                <p style="margin: 0 0 10px 0; color: #231F20; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">Pickup Location</p>
                <p style="margin: 0; color: #231F20; font-size: 16px; line-height: 1.6; font-weight: 500;">
                  ${pickupLocation}
                </p>
              </div>
              ` : ''}
              
              ${statusInfo.actionMessage ? `
              <div style="background-color: ${statusInfo.color === '#FF2E63' ? '#F9D776' : statusInfo.color}; padding: 20px; border-radius: 8px; border: 2px solid #231F20; margin-bottom: 30px; box-shadow: 4px 4px 0px 0px #231F20;">
                <p style="margin: 0; color: #231F20; font-size: 14px; line-height: 1.6; font-weight: 600;">
                  <strong>${statusInfo.actionText}:</strong> ${statusInfo.actionMessage}
                </p>
              </div>
              ` : ''}
              
              ${estimatedDelivery ? `
              <div style="background-color: #FFF9F0; padding: 15px; border-radius: 8px; margin-bottom: 30px; border: 2px solid #231F20;">
                <p style="margin: 0; color: #231F20; font-size: 14px; line-height: 1.6; font-weight: 500;">
                  <strong>Estimated Delivery:</strong> ${estimatedDelivery}
                </p>
              </div>
              ` : ''}
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://spiralgrooverecords.com/order-status?order=${orderNumber}&email=${encodeURIComponent(customerEmail)}" style="display: inline-block; padding: 16px 32px; background-color: #00C2CB; color: #231F20; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; box-shadow: 4px 4px 0px 0px #231F20;">View Order Details</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 0;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; max-width: 600px; margin: 0 auto; background-color: #231F20; border-top: 4px solid #FF2E63;">
          <tr>
            <td style="padding: 30px 20px; text-align: center; color: #FFF9F0; font-size: 12px;">
              <p style="margin: 0 0 8px 0; font-weight: 600;">Spiral Groove Records</p>
              <p style="margin: 0 0 8px 0; color: #999999;">215B Main Street, Milford, OH 45150</p>
              <p style="margin: 15px 0 0 0;">
                <a href="https://spiralgrooverecords.com" style="color: #00C2CB; text-decoration: none; font-weight: 600; margin: 0 10px;">Visit our website</a>
                <span style="color: #666666;">|</span>
                <a href="mailto:info@spiralgrooverecords.com" style="color: #00C2CB; text-decoration: none; font-weight: 600; margin: 0 10px;">Contact us</a>
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
