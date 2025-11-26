import { requireSquareConfig, getLocationId, getClient } from './client';
import { ApiError } from '@/lib/api/errors';

/**
 * Order line item data
 */
export interface OrderLineItem {
  catalogObjectId?: string;
  name?: string;
  quantity: string;
  basePriceMoney: {
    amount: number; // in cents
    currency: string;
  };
}

/**
 * Create order data
 */
export interface CreateOrderData {
  lineItems: OrderLineItem[];
  customerId?: string;
  referenceId?: string;
}

/**
 * Create an order
 */
export async function createOrder(orderData: CreateOrderData) {
  requireSquareConfig();

  const locationId = getLocationId();
  const client = getClient();
  
  try {
    const response = await client.orders.create({
      order: {
        locationId,
        lineItems: orderData.lineItems.map(item => ({
          catalogObjectId: item.catalogObjectId,
          name: item.name,
          quantity: item.quantity,
          basePriceMoney: {
            amount: BigInt(item.basePriceMoney.amount),
            currency: item.basePriceMoney.currency as any,
          },
        })) as any,
        referenceId: orderData.referenceId,
        customerId: orderData.customerId,
      },
    });

    return response.order;
  } catch (error: any) {
    throw new ApiError(
      `Failed to create order: ${error.message}`,
      500,
      'ORDER_CREATE_ERROR',
      { cause: error }
    );
  }
}

/**
 * Get order by ID
 */
export async function getOrder(orderId: string) {
  requireSquareConfig();
  
  if (!orderId) {
    throw new ApiError('Order ID is required', 400, 'MISSING_ORDER_ID');
  }

  try {
    const client = getClient();
    const response = await client.orders.batchGet({
      orderIds: [orderId],
    });

    return response.orders?.[0];
  } catch (error: any) {
    throw new ApiError(
      `Failed to get order: ${error.message}`,
      500,
      'ORDER_GET_ERROR',
      { cause: error }
    );
  }
}

/**
 * Search orders options
 */
export interface SearchOrdersOptions {
  limit?: number;
  cursor?: string;
  query?: {
    filter?: {
      stateFilter?: {
        states: string[];
      };
      dateTimeFilter?: {
        createdAt?: {
          startAt?: string;
          endAt?: string;
        };
      };
    };
  };
}

/**
 * Search orders
 */
export async function searchOrders(options?: SearchOrdersOptions) {
  requireSquareConfig();

  const locationId = getLocationId();
  const client = getClient();

  try {
    const response = await client.orders.search({
      locationIds: [locationId],
      limit: options?.limit || 100,
      cursor: options?.cursor,
      query: options?.query as any,
    });

    return response;
  } catch (error: any) {
    throw new ApiError(
      `Failed to search orders: ${error.message}`,
      500,
      'ORDER_SEARCH_ERROR',
      { cause: error }
    );
  }
}
