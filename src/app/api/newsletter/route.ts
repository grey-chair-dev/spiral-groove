import { NextRequest, NextResponse } from 'next/server';
import { getFeatureFlag } from '@/lib/feature-flags';
import { z } from 'zod';

// Validation schema for newsletter signup
const newsletterSchema = z.object({
  email: z.string().email('Valid email is required'),
  first_name: z.string().max(50).optional(),
  last_name: z.string().max(50).optional(),
  interests: z.array(z.enum(['new-arrivals', 'events', 'sales', 'vinyl-tips', 'local-music'])).optional(),
  source: z.string().max(100).optional()
});

export async function POST(request: NextRequest) {
  try {
    // Check if newsletter is enabled
    if (!getFeatureFlag('FEATURE_NEWSLETTER_ACTIVE')) {
      return NextResponse.json(
        { 
          error: 'Newsletter signup is currently disabled',
          message: 'Please contact us directly at info@spiralgrooverecords.com'
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    const validationResult = newsletterSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const newsletterData = validationResult.data;

    // Generate subscriber ID
    const subscriberId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // In a real implementation, you would:
    // 1. Save to database
    // 2. Add to Mailchimp/HubSpot
    // 3. Send welcome email
    // 4. Add to appropriate segments
    // 5. Track signup source

    // For now, we'll just log it
    console.log('Newsletter signup:', {
      id: subscriberId,
      ...newsletterData,
      subscribed_at: new Date().toISOString(),
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown'
    });

    // Simulate email service integration
    console.log('Adding to email list:', newsletterData.email);
    console.log('Sending welcome email');

    return NextResponse.json({
      status: 'subscribed',
      id: subscriberId,
      message: 'Welcome to the Spiral Groove family! Check your email for a special discount code.',
      welcome_offer: {
        code: 'WELCOME10',
        discount: '10% off your first order',
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      },
      next_steps: [
        'Check your email for confirmation',
        'Follow us on social media',
        'Visit our store at 215 Main St, Milford, OH'
      ],
      meta: {
        subscribed_at: new Date().toISOString(),
        featureFlags: {
          newsletterActive: getFeatureFlag('FEATURE_NEWSLETTER_ACTIVE'),
          checkoutEnabled: getFeatureFlag('FEATURE_CHECKOUT_ENABLED')
        }
      }
    });

  } catch (error) {
    console.error('Newsletter API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to subscribe to newsletter',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
