import { NextRequest, NextResponse } from 'next/server';
import { newsletterSignupSchema } from '@/lib/validation/schemas';
import { sql } from '@/lib/db';
import { rateLimit, getClientIP } from '@/lib/rate-limit';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // Rate limiting: 5 requests per 15 minutes per IP
  const clientIP = getClientIP(request);
  const rateLimitResult = rateLimit(`newsletter:${clientIP}`, {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  });

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: 'Too many requests. Please try again later.',
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
        },
      }
    );
  }

  try {
    const body = await request.json();
    
    // Validate the input
    const validationResult = newsletterSignupSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input. Please check your name and email.' },
        { status: 400 }
      );
    }

    const { firstName, lastName, email } = validationResult.data;

    // Save to email list database using raw SQL
    // Try camelCase first (Prisma default), fallback to snake_case if needed
    try {
      // First attempt: camelCase (Prisma default)
      // Omit id column - let PostgreSQL auto-generate it (SERIAL/BIGSERIAL or UUID with default)
      await sql`
        INSERT INTO email_list ("firstName", "lastName", email, source, "createdAt", "updatedAt")
        VALUES (${firstName || null}, ${lastName || null}, ${email}, 'website_coming_soon', NOW(), NOW())
        ON CONFLICT (email) 
        DO UPDATE SET 
          "firstName" = COALESCE(EXCLUDED."firstName", email_list."firstName"),
          "lastName" = COALESCE(EXCLUDED."lastName", email_list."lastName"),
          "updatedAt" = NOW()
      `;
      console.log('Email added to email list:', { firstName, lastName, email });
    } catch (dbError: any) {
      // If camelCase fails, try snake_case
      if (dbError.code === '42703' || dbError.message?.includes('does not exist')) {
        try {
          await sql`
            INSERT INTO email_list (first_name, last_name, email, source, created_at, updated_at)
            VALUES (${firstName || null}, ${lastName || null}, ${email}, 'website_coming_soon', NOW(), NOW())
            ON CONFLICT (email) 
            DO UPDATE SET 
              first_name = COALESCE(EXCLUDED.first_name, email_list.first_name),
              last_name = COALESCE(EXCLUDED.last_name, email_list.last_name),
              updated_at = NOW()
          `;
          console.log('Email added to email list (snake_case):', { firstName, lastName, email });
        } catch (fallbackError: any) {
          // If id is missing, try with UUID generation
          if (fallbackError.code === '23502' && fallbackError.column === 'id') {
            try {
              await sql`
                INSERT INTO email_list (id, first_name, last_name, email, source, created_at, updated_at)
                VALUES (gen_random_uuid(), ${firstName || null}, ${lastName || null}, ${email}, 'website_coming_soon', NOW(), NOW())
                ON CONFLICT (email) 
                DO UPDATE SET 
                  first_name = COALESCE(EXCLUDED.first_name, email_list.first_name),
                  last_name = COALESCE(EXCLUDED.last_name, email_list.last_name),
                  updated_at = NOW()
              `;
              console.log('Email added to email list (snake_case with UUID):', { firstName, lastName, email });
            } catch (idError: any) {
              console.error('Database error (id handling failed):', idError);
              console.error('Failed to save email to database:', idError);
            }
          } else {
            console.error('Database error (both naming conventions failed):', fallbackError);
            console.error('Failed to save email to database:', fallbackError);
          }
        }
      } else if (dbError.code === '23502' && dbError.column === 'id') {
        // If id error occurs, the column might need to be omitted or use gen_random_uuid()
        // Try with UUID generation if it's a UUID column
        try {
          await sql`
            INSERT INTO email_list (id, "firstName", "lastName", email, source, "createdAt", "updatedAt")
            VALUES (gen_random_uuid(), ${firstName || null}, ${lastName || null}, ${email}, 'website_coming_soon', NOW(), NOW())
            ON CONFLICT (email) 
            DO UPDATE SET 
              "firstName" = COALESCE(EXCLUDED."firstName", email_list."firstName"),
              "lastName" = COALESCE(EXCLUDED."lastName", email_list."lastName"),
              "updatedAt" = NOW()
          `;
          console.log('Email added to email list (camelCase with UUID):', { firstName, lastName, email });
        } catch (idError: any) {
          console.error('Database error (id handling failed):', idError);
          console.error('Failed to save email to database:', idError);
        }
      } else {
        console.error('Database error:', dbError);
        console.error('Failed to save email to database:', dbError);
      }
    }

    // Send to Make.com webhook (optional)
    const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL;
    
    if (makeWebhookUrl) {
      try {
        const webhookResponse = await fetch(makeWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: firstName || '',
            lastName: lastName || '',
            email: email,
            source: 'website_coming_soon',
            timestamp: new Date().toISOString(),
          }),
        });

        if (!webhookResponse.ok) {
          console.error('Make webhook error:', webhookResponse.statusText);
          // Still return success to user even if webhook fails
        } else {
          console.log('Newsletter signup sent to Make:', email);
        }
      } catch (webhookError) {
        console.error('Make webhook request failed:', webhookError);
        // Still return success to user even if webhook fails
      }
    }

    return NextResponse.json(
      { success: true, message: 'Successfully subscribed!' },
      {
        status: 200,
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
        },
      }
    );
  } catch (error) {
    console.error('Newsletter signup error:', error);
    return NextResponse.json(
      { error: 'Failed to process subscription' },
      { status: 500 }
    );
  }
}
