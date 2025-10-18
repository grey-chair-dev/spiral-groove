import { NextRequest, NextResponse } from 'next/server';
import { getFeatureFlag } from '@/lib/feature-flags';
import { z } from 'zod';

// Validation schema for contact form
const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Valid email is required'),
  subject: z.string().min(1, 'Subject is required').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
  phone: z.string().max(20).optional(),
  inquiry_type: z.enum(['general', 'product', 'event', 'partnership', 'other']).optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = contactSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const contactData = validationResult.data;

    // Generate contact ID
    const contactId = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // In a real implementation, you would:
    // 1. Save to database
    // 2. Send email notification to staff
    // 3. Send confirmation email to customer
    // 4. Add to CRM system
    // 5. Route to appropriate department

    // For now, we'll just log it
    console.log('Contact form submitted:', {
      id: contactId,
      ...contactData,
      submitted_at: new Date().toISOString(),
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown'
    });

    // Simulate email sending
    if (getFeatureFlag('FEATURE_NEWSLETTER_ACTIVE')) {
      // In real implementation, send emails here
      console.log('Sending confirmation email to:', contactData.email);
      console.log('Sending notification email to staff');
    }

    return NextResponse.json({
      status: 'received',
      id: contactId,
      message: 'Thank you for contacting us! We\'ll get back to you within 24 hours.',
      estimated_response_time: '24 hours',
      contact_info: {
        phone: '(513) 555-0123',
        email: 'info@spiralgrooverecords.com'
      },
      meta: {
        submitted_at: new Date().toISOString(),
        featureFlags: {
          newsletterActive: getFeatureFlag('FEATURE_NEWSLETTER_ACTIVE')
        }
      }
    });

  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to submit contact form',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
