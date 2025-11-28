import { ApiError } from '@/lib/api/errors';
import { getClient, requireECSConfig } from './client';

export async function processWebhookPayload(type: string, data: any) {
  requireECSConfig();

  const client = getClient();
  if (!client.webhooks || typeof client.webhooks.processPayload !== 'function') {
    throw new ApiError(
      'Webhook processor is not implemented for the configured ECS provider.',
      501,
      'WEBHOOK_NOT_IMPLEMENTED'
    );
  }

  await client.webhooks.processPayload(type, data);
}


