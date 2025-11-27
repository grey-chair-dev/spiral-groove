import { NextRequest, NextResponse } from 'next/server';
import {
  dequeueWebhookTasks,
  isWebhookQueueEnabled,
  moveToDeadLetterQueue,
  WebhookTask,
} from '@/lib/webhooks/queue';
import { handleWebhookEvent } from '@/lib/webhooks/handlers';

export const runtime = 'nodejs';

const MAX_ATTEMPTS = Math.max(Number(process.env.WEBHOOK_PROCESS_MAX_ATTEMPTS ?? 3), 1);
const RETRY_DELAY_MS = Math.max(Number(process.env.WEBHOOK_PROCESS_RETRY_DELAY_MS ?? 250), 0);
const MAX_BACKOFF_MS = Math.max(
  Number(process.env.WEBHOOK_PROCESS_MAX_BACKOFF_MS ?? 4000),
  RETRY_DELAY_MS
);
const BACKOFF_JITTER_MS = Math.max(
  Number(process.env.WEBHOOK_PROCESS_BACKOFF_JITTER_MS ?? 100),
  0
);
const MAX_CONCURRENCY = Math.max(Number(process.env.WEBHOOK_PROCESS_MAX_CONCURRENCY ?? 4), 1);
const LOG_PREFIX = '[SquareWebhookWorker]';
const MAX_LOG_PAYLOAD_CHARS = 2048;

const wait = (ms: number) =>
  ms > 0 ? new Promise((resolve) => setTimeout(resolve, ms)) : Promise.resolve();

const extractLimit = (request: NextRequest): number => {
  const limitParam =
    (request as any).nextUrl?.searchParams?.get('limit') ??
    new URL(request.url).searchParams.get('limit');
  const parsed = limitParam ? Number(limitParam) : 50;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 50;
};

const getAuthorizationToken = (headerValue: string | null): string | null => {
  if (!headerValue) return null;
  const [scheme, ...rest] = headerValue.trim().split(/\s+/);
  if (!scheme || !/^Bearer$/i.test(scheme) || rest.length === 0) {
    return null;
  }
  return rest.join(' ').trim();
};

async function processTask(task: WebhookTask) {
  let lastError: unknown;
  let attempts = task.attempts ?? 0;

  for (let i = 0; i < MAX_ATTEMPTS; i += 1) {
    try {
      await handleWebhookEvent(task.event, task.payload);
      return { success: true, attempts: attempts + 1 };
    } catch (error: any) {
      lastError = error;
      attempts += 1;

      console.error(`${LOG_PREFIX} Task attempt failed`, {
        event: task.event,
        attempts,
        error: error?.message || String(error),
        payloadPreview: task.rawBody.slice(0, MAX_LOG_PAYLOAD_CHARS),
      });

      if (i < MAX_ATTEMPTS - 1) {
        const exponentialDelay = RETRY_DELAY_MS * Math.pow(2, i);
        const boundedDelay = Math.min(exponentialDelay, MAX_BACKOFF_MS);
        const jitter = BACKOFF_JITTER_MS ? Math.random() * BACKOFF_JITTER_MS : 0;
        await wait(boundedDelay + jitter);
      }
    }
  }

  const dlqSize = await moveToDeadLetterQueue({ ...task, attempts }, lastError);
  console.error(`${LOG_PREFIX} Task moved to DLQ`, {
    event: task.event,
    attempts,
    dlqSize,
    payloadPreview: task.rawBody.slice(0, MAX_LOG_PAYLOAD_CHARS),
    error: lastError instanceof Error ? lastError.stack || lastError.message : String(lastError),
  });

  return { success: false, attempts, dlqSize };
}

async function processTasksWithConcurrency(tasks: WebhookTask[]) {
  const results: Array<{ success: boolean; dlqSize?: number | null }> = [];

  for (let i = 0; i < tasks.length; i += MAX_CONCURRENCY) {
    const slice = tasks.slice(i, i + MAX_CONCURRENCY);
    const sliceResults = await Promise.all(
      slice.map(async (task) => {
        const outcome = await processTask(task);
        return outcome;
      })
    );
    results.push(...sliceResults);
  }

  return results;
}

export async function POST(request: NextRequest) {
  const processorToken = process.env.WEBHOOK_PROCESS_TOKEN;
  if (!processorToken) {
    console.error(`${LOG_PREFIX} WEBHOOK_PROCESS_TOKEN is not configured`);
    return NextResponse.json({ error: 'Processor token misconfigured' }, { status: 500 });
  }

  const providedToken = getAuthorizationToken(request.headers.get('authorization'));
  if (providedToken !== processorToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isWebhookQueueEnabled()) {
    return NextResponse.json(
      { error: 'Queue not configured', processed: 0 },
      { status: 412 }
    );
  }

  const maxTasks = extractLimit(request);
  const tasks = await dequeueWebhookTasks(maxTasks);

  let processed = 0;
  let failed = 0;
  let lastDlqSize = 0;

  const outcomes = await processTasksWithConcurrency(tasks);

  for (const outcome of outcomes) {
    if (outcome.success) {
      processed += 1;
    } else {
      failed += 1;
      if (typeof outcome.dlqSize === 'number') {
        lastDlqSize = outcome.dlqSize;
      }
    }
  }

  return NextResponse.json({
    processed,
    failed,
    pulled: tasks.length,
    dlqSize: lastDlqSize,
  });
}

