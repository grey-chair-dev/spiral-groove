import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { POST } from '@/app/api/square/webhooks/route';
import { NextRequest } from 'next/server';
import * as crypto from 'crypto';

const mockClientModule = vi.hoisted(() => ({
  getClient: vi.fn(),
}));

const mockWebhookHandlers = vi.hoisted(() => ({
  handleWebhookEvent: vi.fn().mockResolvedValue(undefined),
  logInfo: vi.fn(),
}));

vi.mock('@/lib/square/client', () => mockClientModule);
vi.mock('@/lib/utils/retry', () => ({
  withSquareRetry: (fn: () => Promise<unknown>) => fn(),
}));
vi.mock('@/lib/webhooks/handlers', () => mockWebhookHandlers);

describe('Square webhook logging', () => {
  const originalEnv = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    process.env.SQUARE_WEBHOOK_SIGNATURE_KEY = 'test-secret';
    consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    mockClientModule.getClient.mockReturnValue({
      inventory: { batchGetCounts: vi.fn().mockResolvedValue([]) },
      catalog: { listCatalog: vi.fn().mockResolvedValue({}) },
    });
  });

  afterEach(() => {
    process.env.SQUARE_WEBHOOK_SIGNATURE_KEY = originalEnv;
    consoleSpy.mockRestore();
    vi.clearAllMocks();
  });

  it('logs sanitized metadata for valid events', async () => {
    const payload = JSON.stringify({
      merchant_id: 'MERCHANT',
      type: 'order.created',
      data: { object: { id: 'ORDER_ID' } },
    });

    const signature = crypto
      .createHmac('sha256', process.env.SQUARE_WEBHOOK_SIGNATURE_KEY as string)
      .update(payload)
      .digest('base64');

    const request = new Request('http://localhost/api/square/webhooks', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-square-hmacsha256-signature': signature,
      },
      body: payload,
    });

    const response = await POST(request as unknown as NextRequest);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(consoleSpy).toHaveBeenCalledWith(
      '[SquareWebhook]',
      'Event received',
      expect.objectContaining({ type: 'order.created', merchant: 'MERCHANT' })
    );
  });

  it('logs test events without signature validation', async () => {
    const payload = JSON.stringify({
      merchant_id: '6SSW_TEST',
      type: 'payment.created',
      data: {},
    });

    const request = new Request('http://localhost/api/square/webhooks', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: payload,
    });

    const response = await POST(request as unknown as NextRequest);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.test).toBe(true);
    expect(consoleSpy).toHaveBeenCalledWith(
      '[SquareWebhook]',
      'Test event received',
      expect.objectContaining({ merchant: '6SSW_TEST' })
    );
  });
});

