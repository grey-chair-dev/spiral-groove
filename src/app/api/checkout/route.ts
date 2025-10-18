import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutLink } from '@/lib/integrations/square';
import { getFeatureFlag } from '@/lib/feature-flags';
import { z } from 'zod';

// Validation schema for checkout request
const checkoutSchema = z.object({
  line_items: z.array(z.object({
    catalog_object_id: z.string().min(1),
    quantity: z.number().int().min(1).max(10)
  })).min(1).max(10),
  fulfillment: z.enum(['SHIP', 'PICKUP']).optional(),
  customer_email: z.string().email().optional(),
  customer_phone: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    // Check if checkout is enabled
    if (!getFeatureFlag('FEATURE_CHECKOUT_ENABLED')) {
      return NextResponse.json(
        { 
          error: 'Checkout is currently disabled',
          message: 'Please contact us directly to place an order'
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    const validationResult = checkoutSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const { line_items, fulfillment = 'SHIP', customer_email, customer_phone } = validationResult.data;

    // Create checkout link via Square
    const checkoutLink = await createCheckoutLink(line_items);

    // In a real implementation, you might want to:
    // 1. Save the order to your database
    // 2. Send confirmation email
    // 3. Update inventory
    // 4. Log the transaction

    return NextResponse.json({
      checkout_url: checkoutLink.checkout_url,
      order_id: checkoutLink.order_id,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
      meta: {
        fulfillment,
        customer_email,
        customer_phone,
        featureFlags: {
          squareLive: getFeatureFlag('FEATURE_SQUARE_LIVE'),
          inStorePickup: getFeatureFlag('FEATURE_IN_STORE_PICKUP')
        }
      }
    });

  } catch (error) {
    console.error('Checkout API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create checkout link',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
