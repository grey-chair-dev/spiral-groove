import { NextRequest } from 'next/server';
import { isSquareConfigured } from '@/lib/square/client';
import { ConfigurationError, ValidationError } from './errors';

// Helper to make sure Square is configured before using it
export function requireSquareConfig() {
  if (!isSquareConfigured()) {
    throw new ConfigurationError(
      'Square API is not configured. Please set SQUARE_ACCESS_TOKEN, SQUARE_ENVIRONMENT, and SQUARE_LOCATION_ID environment variables.'
    );
  }
}

// Parse JSON from request body with error handling
export async function parseBody<T = any>(request: Request): Promise<T> {
  try {
    const body = await request.json();
    return body as T;
  } catch (error) {
    throw new ValidationError('Invalid JSON in request body', {
      cause: error instanceof Error ? error.message : error,
    });
  }
}

// Get query parameters from the request URL
export function getQueryParams(request: Request): URLSearchParams {
  const { searchParams } = new URL(request.url);
  return searchParams;
}

// Get an integer query param, with a default if it's missing or invalid
export function getIntParam(
  searchParams: URLSearchParams,
  key: string,
  defaultValue: number
): number {
  const value = searchParams.get(key);
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

// Get a string query param, with optional default
export function getStringParam(
  searchParams: URLSearchParams,
  key: string,
  defaultValue?: string
): string | undefined {
  return searchParams.get(key) || defaultValue;
}

