import { NextRequest, NextResponse } from 'next/server';
import { dequeueWebhookTasks, isWebhookQueueEnabled } from '@/lib/webhooks/queue';
import { handleWebhookEvent } from '@/lib/webhooks/handlers';

export const runtime = 'nodejs';

async function authorize(request: NextRequest) {
  const token = process.env.WEBHOOK_PROCESS_TOKEN;
  if (!token) return true;

  const header = request.headers.get('authorization');
  if (!header) return false;

  const [, provided] = header.split('Bearer ');
  return provided?.trim() === token;
}

export async function POST(request: NextRequest) {
  if (!(await authorize(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isWebhookQueueEnabled()) {
    return NextResponse.json(
      { error: 'Queue not configured', processed: 0 },
      { status: 412 }
    );
  }

  const limitParam =
    (request as any).nextUrl?.searchParams?.get('limit') ??
    new URL(request.url).searchParams.get('limit');
  const maxTasks = limitParam ? Number(limitParam) : 50;

  const tasks = await dequeueWebhookTasks(Number.isFinite(maxTasks) ? maxTasks : 50);

  let processed = 0;
  for (const task of tasks) {
    try {
      await handleWebhookEvent(task.event, task.payload);
      processed += 1;
    } catch (error: any) {
      console.error('[SquareWebhookWorker] Failed to process task', {
        event: task.event,
        error: error?.message || String(error),
      });
    }
  }

  return NextResponse.json({
    processed,
    remaining: Math.max(tasks.length - processed, 0),
  });
}

