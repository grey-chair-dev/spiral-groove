export type ApiErrorCode =
  | 'INTERNAL_ERROR'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'RATE_LIMITED'
  | 'CONFIGURATION_ERROR'
  | 'MISSING_DATA'
  | 'MISSING_ITEM_ID'
  | 'MISSING_CATALOG_ID'
  | 'MISSING_CHANGES'
  | 'MISSING_IDS';

export interface ApiErrorOptions {
  details?: unknown;
  cause?: unknown;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: ApiErrorCode | string;
  public readonly details?: unknown;

  constructor(
    message: string,
    status: number = 500,
    code: ApiErrorCode | string = 'INTERNAL_ERROR',
    options: ApiErrorOptions = {}
  ) {
    super(message, { cause: options.cause });
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = options.details;
  }
}

export class ValidationError extends ApiError {
  constructor(message = 'Validation failed', details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', { details });
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found', details?: unknown) {
    super(message, 404, 'NOT_FOUND', { details });
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized', details?: unknown) {
    super(message, 401, 'UNAUTHORIZED', { details });
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden', details?: unknown) {
    super(message, 403, 'FORBIDDEN', { details });
    this.name = 'ForbiddenError';
  }
}

export class RateLimitedError extends ApiError {
  constructor(message = 'Too many requests', retryAfterSeconds?: number) {
    super(message, 429, 'RATE_LIMITED', {
      details: retryAfterSeconds ? { retryAfterSeconds } : undefined,
    });
    this.name = 'RateLimitedError';
  }
}

export class ConfigurationError extends ApiError {
  constructor(message = 'Configuration error', details?: unknown) {
    super(message, 500, 'CONFIGURATION_ERROR', { details });
    this.name = 'ConfigurationError';
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return {
      message: error.message,
      status: error.status,
      code: error.code,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message || 'An unexpected error occurred',
      status: 500,
      code: 'INTERNAL_ERROR',
    };
  }

  return {
    message: 'An unexpected error occurred',
    status: 500,
    code: 'INTERNAL_ERROR',
  };
}


