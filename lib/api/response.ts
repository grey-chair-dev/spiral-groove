import { NextResponse } from 'next/server';
import { serializeBigInt } from '@/lib/utils/serialize';

// Standard response format for all our API endpoints
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    cached?: boolean;
    timestamp?: string;
    [key: string]: any;
  };
}

// Helper to send successful responses
// Automatically serializes BigInt values to prevent JSON errors
export function successResponse<T>(
  data: T,
  options?: {
    status?: number;
    message?: string;
    meta?: Record<string, any>;
  }
): NextResponse<ApiResponse<T>> {
  // Serialize the entire response to handle any BigInt values
  const serializedData = serializeBigInt(data);
  const serializedMeta = options?.meta ? serializeBigInt(options.meta) : undefined;

  return NextResponse.json(
    {
      success: true,
      data: serializedData,
      message: options?.message,
      meta: {
        timestamp: new Date().toISOString(),
        ...serializedMeta,
      },
    },
    { status: options?.status || 200 }
  );
}

// Helper for error responses - handles both Error objects and strings
export function errorResponse(
  error: string | Error,
  options?: {
    status?: number;
    code?: string;
    details?: any;
  }
): NextResponse<ApiResponse> {
  const errorMessage = error instanceof Error ? error.message : error;
  const serializedDetails = options?.details ? serializeBigInt(options.details) : undefined;

  return NextResponse.json(
    {
      success: false,
      error: errorMessage,
      code: options?.code,
      meta: {
        timestamp: new Date().toISOString(),
        ...(serializedDetails && { details: serializedDetails }),
      },
    },
    { status: options?.status || 500 }
  );
}

// Quick helpers for common HTTP status codes
export function notFoundResponse(message = 'Resource not found'): NextResponse<ApiResponse> {
  return errorResponse(message, { status: 404, code: 'NOT_FOUND' });
}

export function badRequestResponse(message = 'Bad request', details?: any): NextResponse<ApiResponse> {
  return errorResponse(message, { status: 400, code: 'BAD_REQUEST', details });
}

export function unauthorizedResponse(message = 'Unauthorized'): NextResponse<ApiResponse> {
  return errorResponse(message, { status: 401, code: 'UNAUTHORIZED' });
}

