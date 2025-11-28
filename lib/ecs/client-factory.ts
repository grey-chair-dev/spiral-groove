import templateConfig from '@/config/template';
import type { ECSClient } from './types';
import createProviderClient from './square-client';

let cachedClient: ECSClient | null = null;

function buildClient(): ECSClient {
  switch (templateConfig.commerce.provider) {
    case 'square':
      return createProviderClient();
    case 'shopify':
      throw new Error('Shopify client not yet implemented.');
    default:
      throw new Error(`Unsupported ECS provider: ${templateConfig.commerce.provider}`);
  }
}

export function getECSClient(): ECSClient {
  if (!cachedClient) {
    cachedClient = buildClient();
  }
  return cachedClient;
}

export function resetECSClient() {
  cachedClient = null;
}

