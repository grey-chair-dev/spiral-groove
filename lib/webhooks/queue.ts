import { Redis } from '@upstash/redis';
import { randomUUID } from 'crypto';

type SerializedError = {
  name?: string;
  message: string;
  stack?: string;
  cause?: string;
};

export type WebhookTask = {
  id: string;
  event: string;
  payload: unknown;
  rawBody: string;
  enqueuedAt: string;
  attempts: number;
};

export type DeadLetterTask = WebhookTask & {
  failedAt: string;
  error: SerializedError;
};

const redisUrl = process.env.UPSTASH_REDIS_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const namespace = process.env.SQUARE_APPLICATION_ID?.trim();

if (!namespace && process.env.NODE_ENV !== 'development') {
  console.error(
    '[SquareWebhookQueue] SQUARE_APPLICATION_ID is missing; falling back to default namespace'
  );
}

export const WEBHOOK_QUEUE_KEY = `square-webhook-queue:${namespace || 'default'}`;
export const WEBHOOK_DLQ_KEY = `square-webhook-queue-dlq:${namespace || 'default'}`;

const WEBHOOK_QUEUE_LOG_PREFIX = '[SquareWebhookQueue]';

let redis: Redis | null = null;

if (redisUrl && redisToken) {
  redis = new Redis({
    url: redisUrl,
    token: redisToken,
  });
}

const serializeError = (error: unknown): SerializedError => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause ? String(error.cause) : undefined,
    };
  }

  return {
    message: typeof error === 'string' ? error : JSON.stringify(error),
  };
};

const normalizeTask = (task: Partial<WebhookTask> & { event?: string }): WebhookTask | null => {
  if (!task?.event) {
    return null;
  }

  return {
    id: task.id ?? randomUUID(),
    event: task.event,
    payload: task.payload ?? null,
    rawBody:
      typeof task.rawBody === 'string'
        ? task.rawBody
        : (() => {
            try {
              return JSON.stringify(task.payload ?? {});
            } catch {
              return '';
            }
          })(),
    enqueuedAt: task.enqueuedAt ?? new Date().toISOString(),
    attempts: typeof task.attempts === 'number' ? task.attempts : 0,
  };
};

export const isWebhookQueueEnabled = () => Boolean(redis);

export async function enqueueWebhookTask(
  event: string,
  payload: unknown,
  { rawBody }: { rawBody: string }
): Promise<void> {
  if (!redis) {
    console.info(`${WEBHOOK_QUEUE_LOG_PREFIX} Redis not configured; skipping enqueue`, { event });
    return;
  }

  const entry: WebhookTask = {
    id: randomUUID(),
    event,
    payload,
    rawBody,
    enqueuedAt: new Date().toISOString(),
    attempts: 0,
  };

  try {
    await redis.lpush(WEBHOOK_QUEUE_KEY, JSON.stringify(entry));
  } catch (error: any) {
    console.error(`${WEBHOOK_QUEUE_LOG_PREFIX} Failed to enqueue`, {
      event,
      error: error?.message || String(error),
    });
  }
}

export async function dequeueWebhookTasks(maxTasks = 50): Promise<WebhookTask[]> {
  if (!redis) {
    console.info(`${WEBHOOK_QUEUE_LOG_PREFIX} Redis not configured; cannot dequeue tasks`);
    return [];
  }

  const tasks: WebhookTask[] = [];

  for (let i = 0; i < maxTasks; i += 1) {
    const raw = await redis.rpop(WEBHOOK_QUEUE_KEY);
    if (!raw) break;

    try {
      const parsed = JSON.parse(raw) as Partial<WebhookTask>;
      const normalized = normalizeTask(parsed);
      if (normalized) {
        tasks.push(normalized);
      }
    } catch (error: any) {
      console.error(`${WEBHOOK_QUEUE_LOG_PREFIX} Failed to parse task`, {
        error: error?.message || String(error),
      });
    }
  }

  return tasks;
}

export async function moveToDeadLetterQueue(
  task: WebhookTask,
  error: unknown
): Promise<number | null> {
  if (!redis) {
    console.error(`${WEBHOOK_QUEUE_LOG_PREFIX} Redis not configured; cannot move to DLQ`, {
      event: task.event,
    });
    return 0;
  }

  const enrichedTask: DeadLetterTask = {
    ...task,
    failedAt: new Date().toISOString(),
    error: serializeError(error),
  };

  try {
    return await redis.lpush(WEBHOOK_DLQ_KEY, JSON.stringify(enrichedTask));
  } catch (err: any) {
    console.error(`${WEBHOOK_QUEUE_LOG_PREFIX} Failed to write to DLQ`, {
      event: task.event,
      error: err?.message || String(err),
    });
    return null;
  }
}

export async function requeueDeadLetterTask(taskId: string): Promise<boolean> {
  if (!redis) {
    console.error(`${WEBHOOK_QUEUE_LOG_PREFIX} Redis not configured; cannot requeue DLQ task`, {
      taskId,
    });
    return false;
  }

  try {
    const dlqEntries = await redis.lrange(WEBHOOK_DLQ_KEY, 0, -1);

    for (const entry of dlqEntries) {
      try {
        const parsed = JSON.parse(entry) as DeadLetterTask;
        if (parsed.id !== taskId) continue;

        await redis.lrem(WEBHOOK_DLQ_KEY, 0, entry);

        if (typeof parsed.rawBody !== 'string') {
          console.error(`${WEBHOOK_QUEUE_LOG_PREFIX} DLQ entry missing rawBody`, { taskId });
          return false;
        }

        const task: WebhookTask = {
          id: parsed.id ?? randomUUID(),
          event: parsed.event,
          payload: parsed.payload,
          rawBody: parsed.rawBody,
          enqueuedAt: new Date().toISOString(),
          attempts: 0,
        };

        await redis.lpush(WEBHOOK_QUEUE_KEY, JSON.stringify(task));
        return true;
      } catch (error: any) {
        console.error(`${WEBHOOK_QUEUE_LOG_PREFIX} Failed to requeue DLQ task`, {
          taskId,
          error: error?.message || String(error),
        });
      }
    }
  } catch (error: any) {
    console.error(`${WEBHOOK_QUEUE_LOG_PREFIX} Failed to read DLQ`, {
      error: error?.message || String(error),
    });
  }

  return false;
}

