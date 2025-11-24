import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification (must be raw, not parsed)
    const body = await request.text();
    
    // Square uses x-square-signature header (trim to handle any whitespace issues)
    const signature = request.headers.get('x-square-signature')?.trim();

    // Log incoming webhook for debugging
    console.log('Webhook received:', {
      timestamp: new Date().toISOString(),
      hasSignature: !!signature,
      bodyLength: body.length,
    });

    // Verify webhook signature
    if (!signature) {
      console.error('Missing webhook signature header (x-square-signature)');
      return NextResponse.json(
        { error: 'Missing webhook signature' },
        { status: 400 }
      );
    }

    // Get webhook signature key from environment
    const webhookSignatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;

    if (!webhookSignatureKey) {
      console.error('SQUARE_WEBHOOK_SIGNATURE_KEY not configured');
      return NextResponse.json(
        { error: 'Webhook signature key not configured' },
        { status: 500 }
      );
    }

    // Square signature verification: body only
    // According to Square docs: signature = HMAC-SHA256(body, signature_key)
    const expectedSignature = crypto
      .createHmac('sha256', webhookSignatureKey)
      .update(body)
      .digest('base64');

    // Decode both signatures from base64 to binary buffers for comparison
    const receivedBuf = Buffer.from(signature, 'base64');
    const expectedBuf = Buffer.from(expectedSignature, 'base64');

    // Log for debugging (remove in production)
    console.log('Signature verification:', {
      receivedPrefix: signature.substring(0, 20),
      expectedPrefix: expectedSignature.substring(0, 20),
      receivedLength: receivedBuf.length,
      expectedLength: expectedBuf.length,
    });

    // Ensure equal-length buffers
    if (receivedBuf.length !== expectedBuf.length) {
      console.error('Signature buffer length mismatch', {
        received: receivedBuf.length,
        expected: expectedBuf.length
      });
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    // Timing-safe comparison of binary buffers
    if (!crypto.timingSafeEqual(receivedBuf, expectedBuf)) {
      console.error('Invalid webhook signature - signatures do not match');
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    // Parse webhook data
    const webhookData = JSON.parse(body);
    const { type, event_id, data } = webhookData;

    console.log('Webhook event received:', {
      type,
      event_id,
      timestamp: new Date().toISOString(),
    });

    // Handle different webhook events
    switch (type) {
      case 'order.created':
        await handleOrderCreated(data);
        break;

      case 'order.updated':
        await handleOrderUpdated(data);
        break;

      case 'order.fulfillment.updated':
        await handleOrderFulfillmentUpdated(data);
        break;

      case 'payment.created':
        await handlePaymentCreated(data);
        break;

      case 'payment.updated':
        await handlePaymentUpdated(data);
        break;

      case 'refund.created':
        await handleRefundCreated(data);
        break;

      case 'refund.updated':
        await handleRefundUpdated(data);
        break;

      case 'customer.created':
        await handleCustomerCreated(data);
        break;

      case 'customer.updated':
        await handleCustomerUpdated(data);
        break;

      case 'customer.deleted':
        await handleCustomerDeleted(data);
        break;

      case 'inventory.count.updated':
        await handleInventoryCountUpdated(data);
        break;

      case 'catalog.version.updated':
        await handleCatalogVersionUpdated(data);
        break;

      case 'loyalty.account.created':
      case 'loyalty.account.updated':
      case 'loyalty.account.deleted':
      case 'loyalty.event.created':
      case 'loyalty.program.created':
      case 'loyalty.program.updated':
      case 'loyalty.promotion.created':
      case 'loyalty.promotion.updated':
        await handleLoyaltyEvent(type, data);
        break;

      default:
        console.log(`Unhandled webhook type: ${type}`, data);
    }

    // Return success response
    return NextResponse.json({ 
      success: true, 
      event_id,
      type,
      received_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Event handlers (placeholder implementations - customize as needed)

async function handleOrderCreated(data: any) {
  console.log('Order created:', data);
  // TODO: Create order record in database
  // TODO: Send order confirmation email
  // TODO: Update inventory
}

async function handleOrderUpdated(data: any) {
  console.log('Order updated:', data);
  // TODO: Update order status in database
  // TODO: Send status update email
}

async function handleOrderFulfillmentUpdated(data: any) {
  console.log('Order fulfillment updated:', data);
  // TODO: Update fulfillment status
  // TODO: Send shipping notification
}

async function handlePaymentCreated(data: any) {
  console.log('Payment created:', data);
  // TODO: Confirm payment received
  // TODO: Update order payment status
}

async function handlePaymentUpdated(data: any) {
  console.log('Payment updated:', data);
  // TODO: Handle payment status changes
  // TODO: Handle refunds
}

async function handleRefundCreated(data: any) {
  console.log('Refund created:', data);
  // TODO: Process refund
  // TODO: Update order status
  // TODO: Notify customer
}

async function handleRefundUpdated(data: any) {
  console.log('Refund updated:', data);
  // TODO: Update refund status
}

async function handleCustomerCreated(data: any) {
  console.log('Customer created:', data);
  // TODO: Sync customer to database
}

async function handleCustomerUpdated(data: any) {
  console.log('Customer updated:', data);
  // TODO: Update customer in database
}

async function handleCustomerDeleted(data: any) {
  console.log('Customer deleted:', data);
  // TODO: Handle customer deletion (soft delete recommended)
}

async function handleInventoryCountUpdated(data: any) {
  console.log('Inventory count updated:', data);
  // TODO: Sync inventory quantities
  // TODO: Update product availability
}

async function handleCatalogVersionUpdated(data: any) {
  console.log('Catalog version updated:', data);
  // TODO: Sync catalog changes
  // TODO: Update products/prices
}

async function handleLoyaltyEvent(type: string, data: any) {
  console.log(`Loyalty event (${type}):`, data);
  // TODO: Handle loyalty program events
  // TODO: Sync points/balances
}

