import { NextRequest, NextResponse } from 'next/server';
import { squareClient, isSquareConfigured } from '@/lib/square';

export async function POST(request: NextRequest) {
  try {
    if (!isSquareConfigured()) {
      return NextResponse.json(
        { error: 'Square API not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { 
      sourceId, 
      amount, 
      currency = 'USD', 
      orderId, 
      customerId,
      note 
    } = body;

    if (!sourceId || !amount) {
      return NextResponse.json(
        { error: 'Source ID and amount are required' },
        { status: 400 }
      );
    }

    const { paymentsApi } = squareClient;
    
    // Create payment request
    const paymentRequest = {
      sourceId,
      amountMoney: {
        amount: Math.round(amount * 100), // Convert to cents
        currency
      },
      locationId: process.env.SQUARE_LOCATION_ID!,
      ...(orderId && { orderId }),
      ...(customerId && { customerId }),
      ...(note && { note }),
      autocomplete: true // Auto-complete the payment
    };

    const response = await paymentsApi.createPayment(paymentRequest);

    if (response.result?.payment) {
      return NextResponse.json({ 
        payment: response.result.payment,
        success: true 
      });
    }

    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Error processing Square payment:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!isSquareConfigured()) {
      return NextResponse.json(
        { error: 'Square API not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');
    const orderId = searchParams.get('orderId');

    if (!paymentId && !orderId) {
      return NextResponse.json(
        { error: 'Payment ID or Order ID is required' },
        { status: 400 }
      );
    }

    const { paymentsApi } = squareClient;
    
    if (paymentId) {
      const response = await paymentsApi.getPayment(paymentId);
      return NextResponse.json({ payment: response.result?.payment });
    }

    if (orderId) {
      const response = await paymentsApi.listPayments({
        orderId,
        locationId: process.env.SQUARE_LOCATION_ID!
      });
      return NextResponse.json({ payments: response.result?.payments || [] });
    }
  } catch (error) {
    console.error('Error fetching Square payment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment' },
      { status: 500 }
    );
  }
}
