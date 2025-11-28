import templateConfig from '@/config/template';
import { ConfigurationError } from '@/lib/api/errors';
import { getECSClient, resetECSClient } from './client-factory';
import type { ECSClient } from './types';

const REQUIRED_ENV_VARS = ['ECS_ACCESS_TOKEN', 'ECS_ENVIRONMENT', 'ECS_LOCATION_ID'] as const;

let memoizedClient: ECSClient | null = null;

export function getClient(): ECSClient {
  if (!memoizedClient) {
    memoizedClient = getECSClient();
  }
  return memoizedClient;
}

export function resetClient() {
  memoizedClient = null;
  resetECSClient();
}

export function isECSConfigured(): boolean {
  return REQUIRED_ENV_VARS.every((key) => !!process.env[key]) || !!templateConfig.commerce.locationId;
}

export function requireECSConfig() {
  if (!isECSConfigured()) {
    throw new ConfigurationError(
      'ECS API is not configured. Please set ECS_ACCESS_TOKEN, ECS_ENVIRONMENT, and ECS_LOCATION_ID environment variables.'
    );
  }
}

export function getLocationId(): string {
  return process.env.ECS_LOCATION_ID || templateConfig.commerce.locationId || '';
}


