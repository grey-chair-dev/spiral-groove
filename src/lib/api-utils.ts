/**
 * API utility functions for error handling and response formatting
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { featureFlags } from './feature-flags';

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  statusCode: number;
}

export class ApiException extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(code: string, message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.name = 'ApiException';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

// Common error codes
export const ERROR_CODES = {
  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',
  
  // Business logic errors
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  ORDER_CANNOT_BE_CANCELLED: 'ORDER_CANNOT_BE_CANCELLED',
  
  // External service errors
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  SQUARE_API_ERROR: 'SQUARE_API_ERROR',
  EMAIL_SERVICE_ERROR: 'EMAIL_SERVICE_ERROR',
  
  // Server errors
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Create a standardized API error response
 */
export function createErrorResponse(
  error: ApiError | ApiException | Error,
  requestId?: string
): NextResponse {
  let apiError: ApiError;

  if (error instanceof ApiException) {
    apiError = {
      code: error.code,
      message: error.message,
      details: error.details,
      statusCode: error.statusCode,
    };
  } else if (error instanceof ZodError) {
    apiError = {
      code: ERROR_CODES.VALIDATION_ERROR,
      message: 'Validation failed',
      details: error.errors,
      statusCode: HTTP_STATUS.UNPROCESSABLE_ENTITY,
    };
  } else {
    apiError = {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred',
      details: featureFlags.ENABLE_DEBUG ? error.message : undefined,
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    };
  }

  const response = {
    success: false,
    error: apiError.code,
    message: apiError.message,
    ...(apiError.details && { details: apiError.details }),
    ...(requestId && { requestId }),
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response, { status: apiError.statusCode });
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  statusCode: number = HTTP_STATUS.OK
): NextResponse {
  const response = {
    success: true,
    data,
    ...(message && { message }),
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response, { status: statusCode });
}

/**
 * Create a paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  },
  message?: string
): NextResponse {
  const response = {
    success: true,
    data,
    pagination,
    ...(message && { message }),
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response);
}

/**
 * Handle API errors with proper logging
 */
export function handleApiError(
  error: unknown,
  context: string,
  requestId?: string
): NextResponse {
  console.error(`[${context}] API Error:`, error);

  if (error instanceof ApiException) {
    return createErrorResponse(error, requestId);
  }

  if (error instanceof ZodError) {
    return createErrorResponse(error, requestId);
  }

  if (error instanceof Error) {
    return createErrorResponse(error, requestId);
  }

  // Unknown error
  const unknownError = new ApiException(
    ERROR_CODES.INTERNAL_SERVER_ERROR,
    'An unknown error occurred',
    HTTP_STATUS.INTERNAL_SERVER_ERROR
  );

  return createErrorResponse(unknownError, requestId);
}

/**
 * Validate request body with Zod schema
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: any
): Promise<{ data: T; error?: NextResponse }> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    return { data };
  } catch (error) {
    if (error instanceof ZodError) {
      return { data: null as any, error: createErrorResponse(error) };
    }
    throw error;
  }
}

/**
 * Validate query parameters with Zod schema
 */
export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: any
): { data: T; error?: NextResponse } {
  try {
    const params = Object.fromEntries(searchParams.entries());
    const data = schema.parse(params);
    return { data };
  } catch (error) {
    if (error instanceof ZodError) {
      return { data: null as any, error: createErrorResponse(error) };
    }
    throw error;
  }
}

/**
 * Extract user information from request headers
 */
export function getUserFromRequest(request: NextRequest): {
  userId: string;
  email: string;
  role: string;
} | null {
  const userId = request.headers.get('x-user-id');
  const email = request.headers.get('x-user-email');
  const role = request.headers.get('x-user-role');

  if (!userId || !email || !role) {
    return null;
  }

  return { userId, email, role };
}

/**
 * Check if user has required role
 */
export function hasRequiredRole(
  userRole: string,
  requiredRoles: string[]
): boolean {
  const roleHierarchy = {
    customer: 1,
    staff: 2,
    admin: 3,
  };

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  return requiredRoles.some(role => 
    userLevel >= roleHierarchy[role as keyof typeof roleHierarchy]
  );
}

/**
 * Rate limiting helper
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const key = identifier;
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  rateLimitMap.set(key, record);
  return true;
}

/**
 * Generate request ID for tracking
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Log API request
 */
export function logApiRequest(
  method: string,
  path: string,
  requestId: string,
  userId?: string
): void {
  if (!featureFlags.ENABLE_LOGGING) return;

  console.log(`[${requestId}] ${method} ${path}${userId ? ` (user: ${userId})` : ''}`);
}

/**
 * Log API response
 */
export function logApiResponse(
  method: string,
  path: string,
  requestId: string,
  statusCode: number,
  duration: number
): void {
  if (!featureFlags.ENABLE_LOGGING) return;

  const level = statusCode >= 400 ? 'ERROR' : 'INFO';
  console.log(`[${requestId}] ${method} ${path} - ${statusCode} (${duration}ms)`);
}

/**
 * Async handler wrapper for API routes
 */
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    const startTime = Date.now();
    const requestId = generateRequestId();

    try {
      const response = await handler(...args);
      const duration = Date.now() - startTime;
      
      // Log response
      const request = args[0] as NextRequest;
      logApiResponse(request.method, request.nextUrl.pathname, requestId, response.status, duration);
      
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Log error
      const request = args[0] as NextRequest;
      console.error(`[${requestId}] ${request.method} ${request.nextUrl.pathname} - ERROR (${duration}ms):`, error);
      
      return handleApiError(error, 'API Handler', requestId);
    }
  };
}

/**
 * Feature flag check for API routes
 */
export function requireFeatureFlag(flag: keyof typeof featureFlags) {
  return function decorator(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      if (!featureFlags[flag]) {
        throw new ApiException(
          ERROR_CODES.SERVICE_UNAVAILABLE,
          `Feature ${flag} is not enabled`,
          HTTP_STATUS.SERVICE_UNAVAILABLE
        );
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
