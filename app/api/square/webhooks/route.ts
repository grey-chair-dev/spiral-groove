import { NextRequest, NextResponse } from 'next/server';
import { squareClient, isSquareConfigured } from '@/lib/square';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    if (!isSquareConfigured()) {
      return NextResponse.json(
        { error: 'Square API not configured' },
        { status: 500 }
      );
    }

    const body = await request.text();
    const signature = request.headers.get('x-square-signature');
    const timestamp = request.headers.get('x-square-timestamp');

    // Verify webhook signature
    if (!signature || !timestamp) {
      return NextResponse.json(
        { error: 'Missing webhook signature or timestamp' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const webhookSignatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY!;
    const payload = timestamp + body;
    const expectedSignature = crypto
      .createHmac('sha256', webhookSignatureKey)
      .update(payload)
      .digest('base64');

    if (signature !== expectedSignature) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    const webhookData = JSON.parse(body);
    const { type, data } = webhookData;

    // Handle different webhook events
    switch (type) {
      case 'inventory.updated':
        await handleInventoryUpdate(data);
        break;
      
      case 'order.updated':
        await handleOrderUpdate(data);
        break;
      
      case 'payment.updated':
        await handlePaymentUpdate(data);
        break;
      
      default:
        console.log(`Unhandled webhook type: ${type}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleInventoryUpdate(data: any) {
  try {
    console.log('Inventory updated:', data);
    
    // Here you would typically:
    // 1. Update your local inventory database
    // 2. Sync with your e-commerce platform
    // 3. Send notifications to customers about stock changes
    // 4. Update product availability on your website
    
    // Example: Update product stock in your database
    // await updateProductStock(data.object_id, data.new_quantity);
    
  } catch (error) {
    console.error('Error handling inventory update:', error);
  }
}

async function handleOrderUpdate(data: any) {
  try {
    console.log('Order updated:', data);
    
    // Here you would typically:
    // 1. Update order status in your system
    // 2. Send order confirmation emails
    // 3. Update customer order history
    // 4. Trigger fulfillment processes
    
    // Example: Update order status
    // await updateOrderStatus(data.object_id, data.new_status);
    
  } catch (error) {
    console.error('Error handling order update:', error);
  }
}

async function handlePaymentUpdate(data: any) {
  try {
    console.log('Payment updated:', data);
    
    // Here you would typically:
    // 1. Update payment status in your system
    // 2. Send payment confirmation emails
    // 3. Update order status
    // 4. Trigger order fulfillment
    
    // Example: Update payment status
    // await updatePaymentStatus(data.object_id, data.new_status);
    
  } catch (error) {
    console.error('Error handling payment update:', error);
  }
}
