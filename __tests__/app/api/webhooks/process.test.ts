import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { POST } from '@/app/api/webhooks/process/route';
import { NextRequest } from 'next/server';

const queueMock = vi.hoisted(() => ({
  dequeueWebhookTasks: vi.fn(),
  isWebhookQueueEnabled: vi.fn(),
}));

const handlerMock = vi.hoisted(() => ({
  handleWebhookEvent: vi.fn(),
}));

vi.mock('@/lib/webhooks/queue', () => queueMock);
vi.mock('@/lib/webhooks/handlers', () => handlerMock);

describe('webhook queue processor', () => {
  const originalToken = process.env.WEBHOOK_PROCESS_TOKEN;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.WEBHOOK_PROCESS_TOKEN = 'secret-token';
  });

  afterEach(() => {
    process.env.WEBHOOK_PROCESS_TOKEN = originalToken;
  });

  it('rejects unauthorized requests when token is set', async () => {
    queueMock.isWebhookQueueEnabled.mockReturnValue(true);

    const request = new Request('http://localhost/api/webhooks/process', {
      method: 'POST',
    });

    const response = await POST(request as unknown as NextRequest);
    expect(response.status).toBe(401);
  });

  it('returns precondition failed when queue disabled', async () => {
    queueMock.isWebhookQueueEnabled.mockReturnValue(false);

    const request = new Request('http://localhost/api/webhooks/process', {
      method: 'POST',
      headers: { authorization: 'Bearer secret-token' },
    });

    const response = await POST(request as unknown as NextRequest);
    expect(response.status).toBe(412);
  });

  it('processes dequeued tasks', async () => {
    queueMock.isWebhookQueueEnabled.mockReturnValue(true);
    queueMock.dequeueWebhookTasks.mockResolvedValue([
      { event: 'order.created', payload: { id: '1' }, enqueuedAt: new Date().toISOString() },
      { event: 'payment.created', payload: { id: '2' }, enqueuedAt: new Date().toISOString() },
    ]);
    handlerMock.handleWebhookEvent.mockResolvedValue(undefined);

    const request = new Request('http://localhost/api/webhooks/process', {
      method: 'POST',
      headers: { authorization: 'Bearer secret-token' },
    });

    const response = await POST(request as unknown as NextRequest);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.processed).toBe(2);
    expect(handlerMock.handleWebhookEvent).toHaveBeenCalledTimes(2);
  });
});

