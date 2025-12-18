/**
 * POST /api/signup
 * 
 * User signup endpoint
 * Sends signup confirmation email via unified email webhook
 */

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
      console.error('[Signup API] Invalid JSON in request body:', parseError)
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
    const { email, name, password } = requestBody

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

    console.log('[Signup API] Processing signup:', { email, name })

    // Check if user already exists
    let userId = null
    try {
      const { query } = await import('./db.js')
      
      // Check if email already exists
      const existingUser = await query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      )
      
      if (existingUser.rows.length > 0) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'An account with this email already exists.' 
          }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
      
      // Create user account (password will be handled by auth system if needed)
      // For now, we'll create the user record without password_hash
      // Password authentication can be added later with bcrypt/argon2
      const result = await query(
        `INSERT INTO users (email, name, email_verified, created_at, updated_at)
         VALUES ($1, $2, FALSE, NOW(), NOW())
         RETURNING id`,
        [email, name || null]
      )
      
      userId = result.rows[0].id
      console.log('[Signup API] User created in database:', { userId, email })
    } catch (dbError) {
      console.error('[Signup API] Failed to create user in database:', dbError)
      // Continue to send email even if database save fails
    }

    // Send signup confirmation email
    const { sendEmail } = await import('./sendEmail.js')
    await sendEmail({
      type: 'signup',
      to: email,
      subject: 'Welcome to Spiral Groove Records',
      data: {
        name: name || email.split('@')[0],
        email: email,
        source: 'website',
      },
      dedupeKey: `signup:${email}`,
    })

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Account created successfully! Please check your email for confirmation.'
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
    console.error('[Signup API] Error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to process signup. Please try again later.',
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

