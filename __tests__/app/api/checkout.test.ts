import { describe, it, expect, beforeEach, vi } from 'vitest';
const mockCatalogModule = vi.hoisted(() => ({
  getCatalogItem: vi.fn(),
}));

const mockOrdersModule = vi.hoisted(() => ({
  createOrder: vi.fn(),
}));

const mockClientModule = vi.hoisted(() => ({
  requireECSConfig: vi.fn(),
  getClient: vi.fn(),
}));

const mockMiddlewareModule = vi.hoisted(() => ({
  parseBody: vi.fn(),
}));

vi.mock('@/lib/ecs/catalog', () => mockCatalogModule);
vi.mock('@/lib/ecs/orders', () => mockOrdersModule);
vi.mock('@/lib/ecs/client', () => mockClientModule);
vi.mock('@/lib/api/middleware', () => mockMiddlewareModule);

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/checkout/route';

const mockGetCatalogItem = mockCatalogModule.getCatalogItem as vi.Mock;
const mockCreateOrder = mockOrdersModule.createOrder as vi.Mock;
const mockRequireECSConfig = mockClientModule.requireECSConfig as vi.Mock;
const mockGetClient = mockClientModule.getClient as vi.Mock;
const mockParseBody = mockMiddlewareModule.parseBody as vi.Mock;

describe('POST /api/checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireECSConfig.mockReturnValue(undefined);
    mockGetClient.mockReturnValue({
      checkout: {
        paymentLinks: {
          create: vi.fn().mockResolvedValue({
            paymentLink: { url: 'https://ecs.link/u/test' },
          }),
        },
      },
    });
  });

  it('uses ECS catalog price when creating an order', async () => {
    mockGetCatalogItem.mockResolvedValue({
      objects: [
        {
          itemData: {
            name: 'Test Product',
            variations: [
              {
                id: 'variation-1',
                itemVariationData: {
                  priceMoney: { amount: 2500, currency: 'USD' },
                },
              },
            ],
          },
        },
      ],
    });

    mockCreateOrder.mockResolvedValue({
      id: 'order-123',
      locationId: 'LOCATION_ID',
      lineItems: [
        {
          catalogObjectId: 'variation-1',
          name: 'Test Product',
          quantity: '2',
          basePriceMoney: { amount: 2500, currency: 'USD' },
        },
      ],
    });

    mockParseBody.mockResolvedValueOnce({
      productId: 'product-1',
      variationId: 'variation-1',
      quantity: 2,
    });

    const request = new Request('http://localhost/api/checkout', { method: 'POST' });

    const response = await POST(request as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockCreateOrder).toHaveBeenCalledWith({
      lineItems: [
        {
          catalogObjectId: 'variation-1',
          name: 'Test Product',
          quantity: '2',
          basePriceMoney: { amount: 2500, currency: 'USD' },
        },
      ],
    });
  });

  it('fails when catalog product is missing', async () => {
    mockGetCatalogItem.mockResolvedValue({ objects: [] });

    mockParseBody.mockResolvedValueOnce({
      productId: 'missing-product',
      variationId: 'variation-1',
      quantity: 1,
    });

    const request = new Request('http://localhost/api/checkout', { method: 'POST' });

    const response = await POST(request as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
  });

  it('creates checkout for multiple items', async () => {
    mockParseBody.mockResolvedValueOnce({
      items: [
        { productId: 'product-1', variationId: 'variation-1', quantity: 1 },
        { productId: 'product-2', variationId: 'variation-2', quantity: 3 },
      ],
    });

    mockGetCatalogItem
      .mockResolvedValueOnce({
        objects: [
          {
            itemData: {
              name: 'Product 1',
              variations: [
                {
                  id: 'variation-1',
                  itemVariationData: { priceMoney: { amount: 1000, currency: 'USD' } },
                },
              ],
            },
          },
        ],
      })
      .mockResolvedValueOnce({
        objects: [
          {
            itemData: {
              name: 'Product 2',
              variations: [
                {
                  id: 'variation-2',
                  itemVariationData: { priceMoney: { amount: 500, currency: 'USD' } },
                },
              ],
            },
          },
        ],
      });

    mockCreateOrder.mockResolvedValue({
      id: 'order-456',
      locationId: 'LOCATION_ID',
      lineItems: [],
    });

    const request = new Request('http://localhost/api/checkout', { method: 'POST' });
    const response = await POST(request as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockCreateOrder).toHaveBeenCalledWith({
      lineItems: [
        {
          catalogObjectId: 'variation-1',
          name: 'Product 1',
          quantity: '1',
          basePriceMoney: { amount: 1000, currency: 'USD' },
        },
        {
          catalogObjectId: 'variation-2',
          name: 'Product 2',
          quantity: '3',
          basePriceMoney: { amount: 500, currency: 'USD' },
        },
      ],
    });
  });

  it('fails cart checkout when a product is invalid', async () => {
    mockParseBody.mockResolvedValueOnce({
      items: [
        { productId: 'missing-product', variationId: 'variation-1', quantity: 1 },
      ],
    });

    mockGetCatalogItem.mockResolvedValueOnce({ objects: [] });

    const request = new Request('http://localhost/api/checkout', { method: 'POST' });
    const response = await POST(request as unknown as NextRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });
});

