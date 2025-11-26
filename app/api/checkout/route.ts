import { NextRequest } from 'next/server';
import { getClient, requireSquareConfig, getLocationId } from '@/lib/square/client';
import { getCatalogItem } from '@/lib/square/catalog';
import { createOrder } from '@/lib/square/orders';
import { successResponse, errorResponse, badRequestResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/errors';
import { parseBody } from '@/lib/api/middleware';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Validation schema for checkout request
const checkoutSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  variationId: z.string().min(1, 'Variation ID is required'),
  quantity: z.number().int().positive().default(1),
});

// POST /api/checkout
// Create a Square checkout payment link for a product
export async function POST(request: NextRequest) {
  try {
    requireSquareConfig();
    
    const body = await parseBody(request);
    const validationResult = checkoutSchema.safeParse(body);
    
    if (!validationResult.success) {
      return badRequestResponse(
        'Invalid request data',
        { details: validationResult.error.issues }
      );
    }

    const { productId, variationId, quantity } = validationResult.data;
    const locationId = getLocationId();
    const client = getClient();

    // Fetch the product to get details
    const productResult = await getCatalogItem(productId);
    const product = productResult.objects?.[0];
    
    if (!product) {
      return errorResponse('Product not found', { status: 404 });
    }

    // Find the variation
    const variation = product.itemData?.variations?.find(v => v.id === variationId);
    if (!variation || !variation.itemVariationData) {
      return errorResponse('Product variation not found', { status: 404 });
    }

    const variationData = variation.itemVariationData;
    const priceMoney = variationData.priceMoney;
    
    if (!priceMoney || !priceMoney.amount) {
      return errorResponse('Product variation has no price', { status: 400 });
    }

    // Convert amount to BigInt if needed
    const amount = typeof priceMoney.amount === 'bigint' 
      ? priceMoney.amount 
      : BigInt(Number(priceMoney.amount));

    // Calculate total amount (price * quantity)
    const totalAmount = amount * BigInt(quantity);

    // Create a payment link using Square's Checkout API
    // Square Checkout creates a hosted checkout page
    try {
      // Use Square's Checkout API to create a payment link
      // Note: Square Checkout API requires creating an order first, then getting a checkout URL
      // For simplicity, we'll use Square's Payment Links API if available
      // Otherwise, we'll create an order and provide instructions

      // Create an order first, then provide checkout URL
      // For Square, we'll create an order and then redirect to Square Online checkout
      // or use Square's Payment Links API if configured
      const checkoutUrl = await createSquareCheckoutLink({
        locationId,
        productId,
        variationId,
        quantity,
        amount: totalAmount,
        currency: priceMoney.currency || 'USD',
        productName: product.itemData?.name || 'Product',
      });

      return successResponse({
        checkoutUrl,
        orderId: null, // Will be created after payment
      });
    } catch (error: any) {
      // If Square Checkout API is not available, fall back to creating an order
      // and providing a manual checkout URL or instructions
      console.error('Square Checkout error:', error);
      
      // For now, return an error with instructions
      // In production, you'd want to integrate Square Online or use Square's Payment Links
      return errorResponse(
        'Checkout is not fully configured. Please contact the store for purchase options.',
        { 
          status: 501,
          code: 'CHECKOUT_NOT_CONFIGURED',
          details: {
            message: 'Square Payment Links API integration required',
            productId,
            variationId,
            quantity,
            totalAmount: Number(totalAmount) / 100,
          }
        }
      );
    }
  } catch (error) {
    const { message, status, code } = handleApiError(error);
    return errorResponse(message, { status, code });
  }
}

/**
 * Create a Square checkout link
 * Creates an order and returns a checkout URL
 * Note: This requires Square Online to be enabled or Payment Links API setup
 */
async function createSquareCheckoutLink(params: {
  locationId: string;
  productId: string;
  variationId: string;
  quantity: number;
  amount: bigint;
  currency: string;
  productName: string;
}): Promise<string> {
  const client = getClient();
  const { locationId, variationId, quantity, amount, currency, productName } = params;

  try {
    // Create an order using our helper function
    const order = await createOrder({
      lineItems: [
        {
          catalogObjectId: variationId,
          name: productName,
          quantity: quantity.toString(),
          basePriceMoney: {
            amount: Number(amount),
            currency: currency,
          },
        },
      ],
    });

    const orderId = order?.id;
    
    if (!orderId) {
      throw new Error('Order was not created');
    }

    // For Square Online Checkout, construct the checkout URL
    // Replace with your actual Square Online site URL
    const squareOnlineUrl = process.env.SQUARE_ONLINE_URL || 'https://your-store.square.site';
    return `${squareOnlineUrl}/checkout?order_id=${orderId}`;
    
  } catch (error: any) {
    console.error('Square checkout creation failed:', error);
    throw new Error(
      `Failed to create checkout: ${error.message}. ` +
      'Please ensure Square Online is enabled or configure SQUARE_ONLINE_URL environment variable.'
    );
  }
}

