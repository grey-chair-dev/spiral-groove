import { NextResponse } from 'next/server';
import { isSquareConfigured } from '@/lib/square';

export async function GET() {
  try {
    const configured = isSquareConfigured();
    
    return NextResponse.json({
      configured,
      environment: process.env.SQUARE_ENVIRONMENT || 'sandbox',
      locationId: process.env.SQUARE_LOCATION_ID || null,
      applicationId: process.env.SQUARE_APPLICATION_ID || null,
      hasAccessToken: !!process.env.SQUARE_ACCESS_TOKEN,
      hasWebhookKey: !!process.env.SQUARE_WEBHOOK_SIGNATURE_KEY,
    });
  } catch (error) {
    console.error('Error checking Square status:', error);
    return NextResponse.json(
      { error: 'Failed to check Square status' },
      { status: 500 }
    );
  }
}
