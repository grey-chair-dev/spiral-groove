/**
 * POST /api/forgot-password
 * 
 * Password reset request endpoint
 * Sends password reset email via unified email webhook
 */

import crypto from 'crypto'
import { withWebHandler } from './_vercelNodeAdapter.js'

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
      console.error('[Forgot Password API] Invalid JSON in request body:', parseError)
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

    console.log('[Forgot Password API] Processing password reset request:', { email })

    // Verify user exists and generate reset token
    let resetToken = null
    let userId = null
    
    try {
      const { query } = await import('./db.js')
      
      // Check if user exists
      const userResult = await query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      )
      
      if (userResult.rows.length > 0) {
        userId = userResult.rows[0].id
      }
      
      // Generate reset token
      resetToken = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
      
      // Store reset token in database
      await query(
        `INSERT INTO password_reset_tokens (user_id, email, token, expires_at, used, created_at)
         VALUES ($1, $2, $3, $4, FALSE, NOW())`,
        [userId, email, resetToken, expiresAt]
      )
      
      console.log('[Forgot Password API] Reset token stored in database:', { email, token: resetToken.substring(0, 8) + '...' })
    } catch (dbError) {
      console.error('[Forgot Password API] Failed to store reset token:', dbError)
      // Still generate token and send email even if database save fails
      if (!resetToken) {
        resetToken = crypto.randomUUID()
      }
    }
    
    // If token wasn't generated above, generate it now
    if (!resetToken) {
      resetToken = crypto.randomUUID()
    }
    
    const resetUrl = `${process.env.SITE_URL || 'https://spiralgrooverecords.com'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`

    // Send password reset email
    const { sendEmail } = await import('./sendEmail.js')
    await sendEmail({
      type: 'forgot_password',
      to: email,
      subject: 'Reset Your Password - Spiral Groove Records',
      data: {
        email: email,
        resetToken: resetToken,
        resetUrl: resetUrl,
        expiresIn: '1 hour',
        source: 'website',
      },
      dedupeKey: `forgot_password:${email}`,
      dedupeTtlMs: 15 * 60 * 1000, // 15 minutes - prevent spam
    })

    // Always return success (don't reveal if email exists or not for security)
    return new Response(
      JSON.stringify({
        success: true,
        message: 'If an account exists with that email, a password reset link has been sent.'
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
    console.error('[Forgot Password API] Error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to process request. Please try again later.',
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

