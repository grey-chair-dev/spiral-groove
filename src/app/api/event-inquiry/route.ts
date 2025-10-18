import { NextRequest, NextResponse } from 'next/server';
import { getFeatureFlag } from '@/lib/feature-flags';
import { z } from 'zod';

// Validation schema for event inquiry
const eventInquirySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Phone number is required').max(20),
  event_date: z.string().min(1, 'Event date is required'),
  event_time: z.string().min(1, 'Event time is required'),
  attendance: z.number().int().min(1, 'Attendance must be at least 1').max(100),
  event_type: z.enum(['concert', 'listening-party', 'workshop', 'meetup', 'other']),
  description: z.string().min(10, 'Please provide more details').max(1000),
  special_requirements: z.string().max(500).optional(),
  budget: z.string().max(50).optional()
});

export async function POST(request: NextRequest) {
  try {
    // Check if event inquiries are enabled
    if (!getFeatureFlag('FEATURE_EVENT_INQUIRIES')) {
      return NextResponse.json(
        { 
          error: 'Event inquiries are currently disabled',
          message: 'Please contact us directly at info@spiralgrooverecords.com'
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    const validationResult = eventInquirySchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const inquiryData = validationResult.data;

    // Generate inquiry ID
    const inquiryId = `inq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // In a real implementation, you would:
    // 1. Save to database
    // 2. Send email notification to staff
    // 3. Send confirmation email to customer
    // 4. Add to CRM system
    // 5. Create calendar event

    // For now, we'll just log it
    console.log('Event inquiry received:', {
      id: inquiryId,
      ...inquiryData,
      submitted_at: new Date().toISOString(),
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    });

    // Simulate email sending
    if (getFeatureFlag('FEATURE_NEWSLETTER_ACTIVE')) {
      // In real implementation, send emails here
      console.log('Sending confirmation email to:', inquiryData.email);
      console.log('Sending notification email to staff');
    }

    return NextResponse.json({
      status: 'received',
      id: inquiryId,
      message: 'Thank you for your inquiry! We\'ll get back to you within 24 hours.',
      estimated_response_time: '24 hours',
      contact_info: {
        phone: '(513) 555-0123',
        email: 'events@spiralgrooverecords.com'
      },
      meta: {
        submitted_at: new Date().toISOString(),
        featureFlags: {
          newsletterActive: getFeatureFlag('FEATURE_NEWSLETTER_ACTIVE')
        }
      }
    });

  } catch (error) {
    console.error('Event inquiry API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to submit inquiry',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
