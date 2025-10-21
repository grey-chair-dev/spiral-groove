import { NextRequest, NextResponse } from 'next/server';
import { squareClient, isSquareConfigured } from '@/lib/square';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!isSquareConfigured()) {
      return NextResponse.json(
        { error: 'Square API not configured' },
        { status: 500 }
      );
    }

    const orderId = params.id;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const { ordersApi } = squareClient;
    
    // Get order details
    const response = await ordersApi.retrieveOrder(orderId);

    if (response.result?.order) {
      return NextResponse.json({ 
        order: response.result.order,
        success: true 
      });
    }

    return NextResponse.json(
      { error: 'Order not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching Square order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!isSquareConfigured()) {
      return NextResponse.json(
        { error: 'Square API not configured' },
        { status: 500 }
      );
    }

    const orderId = params.id;
    const body = await request.json();
    const { state, note } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const { ordersApi } = squareClient;
    
    // Update order
    const updateOrderRequest = {
      order: {
        locationId: process.env.SQUARE_LOCATION_ID!,
        ...(state && { state }),
        ...(note && { note })
      }
    };

    const response = await ordersApi.updateOrder(orderId, updateOrderRequest);

    if (response.result?.order) {
      return NextResponse.json({ 
        order: response.result.order,
        success: true 
      });
    }

    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Error updating Square order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
