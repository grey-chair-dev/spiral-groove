import { Redis } from '@upstash/redis';

export const WEBHOOK_QUEUE_KEY = 'square:webhook:tasks';

let redis: Redis | null = null;

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (redisUrl && redisToken) {
  redis = new Redis({
    url: redisUrl,
    token: redisToken,
  });
}

export async function enqueueWebhookTask(
  event: string,
  payload: Record<string, unknown>
): Promise<void> {
  if (!redis) {
    console.info('[SquareWebhookQueue] Redis not configured; skipping enqueue', { event });
    return;
  }

  const entry = {
    event,
    payload,
    enqueuedAt: new Date().toISOString(),
  };

  try {
    await redis.lpush(WEBHOOK_QUEUE_KEY, JSON.stringify(entry));
  } catch (error: any) {
    console.error('[SquareWebhookQueue] Failed to enqueue', {
      event,
      error: error?.message || String(error),
    });
  }
}

export type WebhookTask = {
  event: string;
  payload: Record<string, unknown>;
  enqueuedAt: string;
};

export const isWebhookQueueEnabled = () => Boolean(redis);

export async function dequeueWebhookTasks(maxTasks = 50): Promise<WebhookTask[]> {
  if (!redis) {
    console.info('[SquareWebhookQueue] Redis not configured; cannot dequeue tasks');
    return [];
  }

  const tasks: WebhookTask[] = [];

  for (let i = 0; i < maxTasks; i += 1) {
    const raw = await redis.rpop(WEBHOOK_QUEUE_KEY);
    if (!raw) break;

    try {
      const parsed = JSON.parse(raw) as WebhookTask;
      tasks.push(parsed);
    } catch (error: any) {
      console.error('[SquareWebhookQueue] Failed to parse task', {
        error: error?.message || String(error),
      });
    }
  }

  return tasks;
}

