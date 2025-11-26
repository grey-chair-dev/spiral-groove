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
  // Optional: support multiple items (cart checkout)
  items: z.array(z.object({
    productId: z.string(),
    variationId: z.string(),
    quantity: z.number().int().positive(),
  })).optional(),
  // Single item checkout (for backward compatibility)
  productId: z.string().optional(),
  variationId: z.string().optional(),
  quantity: z.number().int().positive().optional(),
}).refine(
  (data) => data.items || (data.productId && data.variationId),
  {
    message: 'Either items array or productId/variationId is required',
  }
);

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

    const { productId, variationId, quantity, items } = validationResult.data;
    const locationId = getLocationId();

    // If items array is provided, create checkout for multiple items (cart checkout)
    if (items && items.length > 0) {
      return await createCartCheckout(items, locationId);
    }

    // Single item checkout (backward compatibility)
    if (!productId || !variationId) {
      return badRequestResponse('productId and variationId are required for single item checkout');
    }

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
    const itemQuantity = quantity || 1;
    const totalAmount = amount * BigInt(itemQuantity);

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
        quantity: itemQuantity,
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
 * Create checkout for multiple cart items
 */
async function createCartCheckout(
  items: Array<{ productId: string; variationId: string; quantity: number }>,
  locationId: string
) {
  try {
    const client = getClient();
    const lineItems: any[] = [];

    // Fetch all products and build line items
    for (const item of items) {
      const productResult = await getCatalogItem(item.productId);
      const product = productResult.objects?.[0];
      
      if (!product) {
        continue; // Skip invalid products
      }

      const variation = product.itemData?.variations?.find(v => v.id === item.variationId);
      if (!variation || !variation.itemVariationData?.priceMoney) {
        continue; // Skip invalid variations
      }

      const priceMoney = variation.itemVariationData.priceMoney;
      const amount = typeof priceMoney.amount === 'bigint' 
        ? priceMoney.amount 
        : BigInt(Number(priceMoney.amount));

      lineItems.push({
        catalogObjectId: item.variationId,
        name: product.itemData?.name || 'Product',
        quantity: item.quantity.toString(),
        basePriceMoney: {
          amount: Number(amount),
          currency: priceMoney.currency || 'USD',
        },
      });
    }

    if (lineItems.length === 0) {
      return errorResponse('No valid items to checkout', { status: 400 });
    }

    // Create order with all line items
    const order = await createOrder({
      lineItems: lineItems.map(item => ({
        catalogObjectId: item.catalogObjectId,
        name: item.name,
        quantity: item.quantity,
        basePriceMoney: {
          amount: item.basePriceMoney.amount,
          currency: item.basePriceMoney.currency,
        },
      })),
    });

    if (!order?.id) {
      throw new Error('Order was not created');
    }

    // Use Square Checkout API to create a payment link
    // Pass the full order object
    const checkoutUrl = await createSquarePaymentLink(order);

    return successResponse({
      checkoutUrl,
      orderId: order.id,
    });
  } catch (error: any) {
    console.error('Cart checkout creation failed:', error);
    return errorResponse(
      `Failed to create checkout: ${error.message}`,
      { status: 500 }
    );
  }
}

/**
 * Create a Square payment link using the Checkout API
 * Uses Square's CreatePaymentLink endpoint to generate a checkout URL
 * @param order - The Square Order object (must include locationId, but NOT id - it's read-only)
 */
async function createSquarePaymentLink(order: any): Promise<string> {
  const client = getClient();

  try {
    // Use Square Checkout API to create a payment link
    // The Checkout API requires an idempotency key
    const orderId = order.id || `order-${Date.now()}`;
    const idempotencyKey = `${orderId}-${Date.now()}`;

    // Create a clean order object without read-only fields
    // Square doesn't allow setting id, version, createdAt, updatedAt, etc.
    // Also need to clean line items - remove calculated fields like variation_total_price_money
    const cleanLineItems = (order.lineItems || []).map((item: any) => {
      // Only include writable fields for line items
      const cleanItem: any = {};
      
      if (item.catalogObjectId) cleanItem.catalogObjectId = item.catalogObjectId;
      if (item.catalogVersion) cleanItem.catalogVersion = item.catalogVersion;
      if (item.name) cleanItem.name = item.name;
      if (item.quantity) cleanItem.quantity = item.quantity;
      if (item.basePriceMoney) cleanItem.basePriceMoney = item.basePriceMoney;
      if (item.variationName) cleanItem.variationName = item.variationName;
      if (item.note) cleanItem.note = item.note;
      if (item.modifiers) cleanItem.modifiers = item.modifiers;
      if (item.taxes) cleanItem.taxes = item.taxes;
      if (item.discounts) cleanItem.discounts = item.discounts;
      
      // Exclude read-only fields:
      // - uid (auto-generated)
      // - variationTotalPriceMoney (calculated)
      // - grossSalesMoney (calculated)
      // - totalTaxMoney (calculated)
      // - totalDiscountMoney (calculated)
      // - totalMoney (calculated)
      
      return cleanItem;
    });

    const orderForCheckout = {
      locationId: order.locationId,
      lineItems: cleanLineItems,
      referenceId: order.referenceId,
      customerId: order.customerId,
      // Exclude: id, version, createdAt, updatedAt, closedAt, state
    };

    // Access paymentLinks through checkout.paymentLinks
    // Pass the order object without read-only fields
    const response = await client.checkout.paymentLinks.create({
      idempotencyKey,
      order: orderForCheckout, // Order without read-only fields
      checkoutOptions: {
        askForShippingAddress: false,
        allowTipping: false, // Set to true if you want to allow tips
      },
    });

    // The payment link URL is in the format: https://square.link/u/{short_url_id}
    // Square SDK returns the response directly
    if (response.paymentLink?.url) {
      return response.paymentLink.url;
    }

    throw new Error('Payment link URL not returned from Square');
  } catch (error: any) {
    console.error('Square Checkout API error:', error);
    throw new Error(
      `Failed to create payment link: ${error.message}. ` +
      'Please ensure Square Checkout API is enabled and properly configured.'
    );
  }
}

/**
 * Create a Square checkout link (single item)
 * Creates an order and returns a checkout URL using Square Checkout API
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

    if (!order?.id) {
      throw new Error('Order was not created');
    }

    // Use Square Checkout API to create a payment link
    // Pass the full order object
    return await createSquarePaymentLink(order);
    
  } catch (error: any) {
    console.error('Square checkout creation failed:', error);
    throw new Error(
      `Failed to create checkout: ${error.message}. ` +
      'Please ensure Square Checkout API is enabled and properly configured.'
    );
  }
}

