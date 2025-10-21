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
    const { lineItems, customerId, shippingAddress } = body;

    if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
      return NextResponse.json(
        { error: 'Line items are required' },
        { status: 400 }
      );
    }

    const { ordersApi } = squareClient;
    
    // Create order
    const orderRequest = {
      order: {
        locationId: process.env.SQUARE_LOCATION_ID!,
        lineItems: lineItems.map((item: any) => ({
          catalogObjectId: item.productId,
          quantity: item.quantity.toString(),
          basePriceMoney: {
            amount: Math.round(item.price * 100), // Convert to cents
            currency: 'USD'
          }
        })),
        ...(customerId && { customerId }),
        ...(shippingAddress && { 
          fulfillments: [{
            type: 'SHIPMENT',
            shipmentDetails: {
              recipient: {
                address: shippingAddress
              }
            }
          }]
        })
      }
    };

    const response = await ordersApi.createOrder(orderRequest);

    if (response.result?.order) {
      return NextResponse.json({ 
        order: response.result.order,
        success: true 
      });
    }

    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Error creating Square order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
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
    const customerId = searchParams.get('customerId');
    const status = searchParams.get('status');

    const { ordersApi } = squareClient;
    
    const searchOrdersRequest = {
      locationIds: [process.env.SQUARE_LOCATION_ID!],
      query: {
        filter: {
          ...(customerId && { customerFilter: { customerIds: [customerId] } }),
          ...(status && { stateFilter: { states: [status] } })
        }
      }
    };

    const response = await ordersApi.searchOrders(searchOrdersRequest);

    if (response.result?.orders) {
      return NextResponse.json({ orders: response.result.orders });
    }

    return NextResponse.json({ orders: [] });
  } catch (error) {
    console.error('Error fetching Square orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
