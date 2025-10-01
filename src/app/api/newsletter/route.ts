import { NextRequest, NextResponse } from 'next/server';
import { NewsletterSubscription, ApiResponse } from '@/types';

// Mailchimp integration (placeholder - would need actual implementation)
async function addToMailchimp(subscription: NewsletterSubscription) {
  // This would integrate with Mailchimp API
  // For now, just log the subscription
  console.log('Newsletter subscription:', subscription);
  return true;
}

// Square Marketing integration (placeholder)
async function addToSquareMarketing(subscription: NewsletterSubscription) {
  // This would integrate with Square Marketing API
  console.log('Square Marketing subscription:', subscription);
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName, lastName, interests } = body;

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const subscription: NewsletterSubscription = {
      email: email.toLowerCase().trim(),
      firstName: firstName?.trim(),
      lastName: lastName?.trim(),
      interests: interests || [],
    };

    // Add to both Mailchimp and Square Marketing
    const [mailchimpSuccess, squareSuccess] = await Promise.allSettled([
      addToMailchimp(subscription),
      addToSquareMarketing(subscription),
    ]);

    // Check if at least one integration succeeded
    const success = 
      mailchimpSuccess.status === 'fulfilled' || 
      squareSuccess.status === 'fulfilled';

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to subscribe to newsletter' },
        { status: 500 }
      );
    }

    const response: ApiResponse<null> = {
      success: true,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error processing newsletter subscription:', error);
    
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to process subscription',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Newsletter API endpoint',
    methods: ['POST'],
    requiredFields: ['email'],
    optionalFields: ['firstName', 'lastName', 'interests'],
  });
}

