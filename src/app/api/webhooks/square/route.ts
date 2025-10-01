import { NextRequest, NextResponse } from 'next/server';
import { SquareService } from '@/lib/square';
import { CacheService } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-square-signature');
    const webhookUrl = request.url;

    // Verify webhook signature
    if (!SquareService.verifyWebhookSignature(body, signature || '', webhookUrl)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const webhookData = JSON.parse(body);
    const { type, data } = webhookData;

    console.log('Received Square webhook:', type);

    switch (type) {
      case 'catalog.version.updated':
        // Refresh products cache when catalog is updated
        await CacheService.invalidateProductsCache();
        console.log('Products cache invalidated due to catalog update');
        break;

      case 'inventory.count.updated':
        // Update inventory cache for specific item
        if (data?.object?.catalog_object_id) {
          const productId = data.object.catalog_object_id;
          const newCount = parseInt(data.object.quantity || '0');
          
          await CacheService.cacheInventoryCount(productId, newCount);
          await CacheService.invalidateProductCache(productId);
          
          console.log(`Inventory updated for product ${productId}: ${newCount}`);
        }
        break;

      case 'order.created':
        // Handle new order creation
        if (data?.object?.order) {
          const order = data.object.order;
          console.log('New order created:', order.id);
          
          // Here you could:
          // - Send confirmation email
          // - Update inventory
          // - Log to analytics
          // - Update CRM
        }
        break;

      case 'order.updated':
        // Handle order updates
        if (data?.object?.order) {
          const order = data.object.order;
          console.log('Order updated:', order.id, 'Status:', order.state);
        }
        break;

      case 'payment.created':
        // Handle payment completion
        if (data?.object?.payment) {
          const payment = data.object.payment;
          console.log('Payment created:', payment.id, 'Status:', payment.status);
        }
        break;

      default:
        console.log('Unhandled webhook type:', type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Handle GET requests for webhook verification
export async function GET() {
  return NextResponse.json({ 
    message: 'Square webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}

