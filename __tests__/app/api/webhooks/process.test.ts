import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { POST } from '@/app/api/webhooks/process/route';
import { NextRequest } from 'next/server';

const queueMock = vi.hoisted(() => ({
  dequeueWebhookTasks: vi.fn(),
  isWebhookQueueEnabled: vi.fn(),
  moveToDeadLetterQueue: vi.fn(),
}));

const handlerMock = vi.hoisted(() => ({
  handleWebhookEvent: vi.fn(),
}));

vi.mock('@/lib/webhooks/queue', () => queueMock);
vi.mock('@/lib/webhooks/handlers', () => handlerMock);

describe('webhook queue processor', () => {
  const originalToken = process.env.WEBHOOK_PROCESS_TOKEN;
  const originalMaxAttempts = process.env.WEBHOOK_PROCESS_MAX_ATTEMPTS;
  const originalRetryDelay = process.env.WEBHOOK_PROCESS_RETRY_DELAY_MS;
  const originalMaxBackoff = process.env.WEBHOOK_PROCESS_MAX_BACKOFF_MS;
  const originalBackoffJitter = process.env.WEBHOOK_PROCESS_BACKOFF_JITTER_MS;
  const originalConcurrency = process.env.WEBHOOK_PROCESS_MAX_CONCURRENCY;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.WEBHOOK_PROCESS_TOKEN = 'secret-token';
    process.env.WEBHOOK_PROCESS_MAX_ATTEMPTS = '2';
    process.env.WEBHOOK_PROCESS_RETRY_DELAY_MS = '0';
    process.env.WEBHOOK_PROCESS_MAX_BACKOFF_MS = '0';
    process.env.WEBHOOK_PROCESS_BACKOFF_JITTER_MS = '0';
    process.env.WEBHOOK_PROCESS_MAX_CONCURRENCY = '1';
    queueMock.moveToDeadLetterQueue.mockResolvedValue(1);
  });

  afterEach(() => {
    process.env.WEBHOOK_PROCESS_TOKEN = originalToken;
    process.env.WEBHOOK_PROCESS_MAX_ATTEMPTS = originalMaxAttempts;
    process.env.WEBHOOK_PROCESS_RETRY_DELAY_MS = originalRetryDelay;
    process.env.WEBHOOK_PROCESS_MAX_BACKOFF_MS = originalMaxBackoff;
    process.env.WEBHOOK_PROCESS_BACKOFF_JITTER_MS = originalBackoffJitter;
    process.env.WEBHOOK_PROCESS_MAX_CONCURRENCY = originalConcurrency;
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
      {
        id: 'task-1',
        event: 'order.created',
        payload: { id: '1' },
        rawBody: JSON.stringify({ id: '1' }),
        enqueuedAt: new Date().toISOString(),
        attempts: 0,
      },
      {
        id: 'task-2',
        event: 'payment.created',
        payload: { id: '2' },
        rawBody: JSON.stringify({ id: '2' }),
        enqueuedAt: new Date().toISOString(),
        attempts: 0,
      },
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
    expect(body.failed).toBe(0);
    expect(body.pulled).toBe(2);
    expect(handlerMock.handleWebhookEvent).toHaveBeenCalledTimes(2);
  });

  it('moves failed tasks to the DLQ after retries', async () => {
    queueMock.isWebhookQueueEnabled.mockReturnValue(true);
    queueMock.dequeueWebhookTasks.mockResolvedValue([
      {
        id: 'task-1',
        event: 'order.created',
        payload: {},
        rawBody: '{}',
        enqueuedAt: new Date().toISOString(),
        attempts: 0,
      },
    ]);
    handlerMock.handleWebhookEvent.mockRejectedValue(new Error('boom'));

    const request = new Request('http://localhost/api/webhooks/process', {
      method: 'POST',
      headers: { authorization: 'Bearer secret-token' },
    });

    const response = await POST(request as unknown as NextRequest);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.processed).toBe(0);
    expect(body.failed).toBe(1);
    expect(queueMock.moveToDeadLetterQueue).toHaveBeenCalledTimes(1);
  });
});


