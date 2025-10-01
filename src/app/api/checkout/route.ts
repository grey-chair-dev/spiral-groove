import { NextRequest, NextResponse } from 'next/server';
import { SquareService } from '@/lib/square';
import { CheckoutResponse, ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, redirectUrl } = body;

    // Validate request
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Items are required' },
        { status: 400 }
      );
    }

    if (!redirectUrl) {
      return NextResponse.json(
        { success: false, error: 'Redirect URL is required' },
        { status: 400 }
      );
    }

    // Validate items structure
    for (const item of items) {
      if (!item.id || !item.quantity || item.quantity <= 0) {
        return NextResponse.json(
          { success: false, error: 'Invalid item structure' },
          { status: 400 }
        );
      }
    }

    // Create checkout session
    const checkoutData = await SquareService.createCheckoutSession(
      items,
      redirectUrl
    );

    const response: ApiResponse<CheckoutResponse> = {
      success: true,
      data: checkoutData,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to create checkout session',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Get order details from Square
    const order = await SquareService.getOrder(sessionId);

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const response: ApiResponse<any> = {
      success: true,
      data: order,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching order:', error);
    
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch order',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

