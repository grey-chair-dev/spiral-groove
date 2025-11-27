import { NextRequest } from 'next/server';
import { newsletterSignupSchema } from '@/lib/validation/schemas';
import { upsertEmail } from '@/lib/db/email-list';
import { rateLimit, getClientIP } from '@/lib/rate-limit';
import { successResponse, errorResponse } from '@/lib/api/response';
import { ValidationError, handleApiError } from '@/lib/api/errors';
import { sendWebhook } from '@/lib/api/webhooks';
import { parseBody } from '@/lib/api/middleware';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST /api/newsletter
// Subscribe someone to our email list
export async function POST(request: NextRequest) {
  // Rate limit: 5 signups per 15 minutes per IP (prevents spam)
  const clientIP = getClientIP(request);
  const rateLimitResult = await rateLimit(`newsletter:${clientIP}`, {
    windowMs: 15 * 60 * 1000,  // 15 minutes
    maxRequests: 5,
  });

  if (!rateLimitResult.success) {
    return errorResponse('Too many requests. Please try again later.', {
      status: 429,
      code: 'RATE_LIMIT_EXCEEDED',
      details: {
        retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
      },
    });
  }

  try {
    const body = await parseBody(request);
    
    // Validate the input
    const validationResult = newsletterSignupSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationError('Invalid input', validationResult.error.issues);
    }

    const { firstName, lastName, email } = validationResult.data;

    // Save to our database
    await upsertEmail({
      firstName,
      lastName,
      email,
      source: 'website_coming_soon',
    });

    // Send to Make.com webhook if configured (fire and forget - don't block the response)
    const webhookUrl = process.env.MAKE_WEBHOOK_URL;
    if (webhookUrl) {
      sendWebhook(webhookUrl, {
        firstName: firstName || '',
        lastName: lastName || '',
        email,
        source: 'website_coming_soon',
        timestamp: new Date().toISOString(),
      });
    }

    return successResponse(
      { email, firstName, lastName },
      {
        message: 'Successfully subscribed!',
        meta: {
          rateLimit: {
            limit: 5,
            remaining: rateLimitResult.remaining,
            reset: new Date(rateLimitResult.resetTime).toISOString(),
          },
        },
      }
    );
  } catch (error) {
    const { message, status, code } = handleApiError(error);
    return errorResponse(message, { status, code });
  }
}
