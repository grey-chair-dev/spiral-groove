import { processWebhookPayload } from '@/lib/ecs/payload-processor';

const WEBHOOK_LOG_PREFIX = '[ECSWebhookWorker]';

export const logInfo = (message: string, context: Record<string, unknown> = {}) => {
  console.info(WEBHOOK_LOG_PREFIX, message, context);
};

export async function handleWebhookEvent(type: string, data: any) {
  logInfo('Delegating webhook payload', { type });
  await processWebhookPayload(type, data);
}

