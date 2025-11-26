// Custom error classes so we can handle different error types properly
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
    Error.captureStackTrace(this, this.constructor);
  }
}

// For validation issues (bad input from user)
export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

// When something doesn't exist
export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

// Authentication/authorization issues
export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

// When env vars or config is missing
export class ConfigurationError extends ApiError {
  constructor(message: string) {
    super(message, 500, 'CONFIGURATION_ERROR');
    this.name = 'ConfigurationError';
  }
}

// Convert any error into a consistent format for API responses
export function handleApiError(error: unknown): { message: string; status: number; code?: string } {
  if (error instanceof ApiError) {
    return {
      message: error.message,
      status: error.statusCode,
      code: error.code,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message || 'An unexpected error occurred',
      status: 500,
      code: 'INTERNAL_ERROR',
    };
  }

  // Fallback for truly unknown errors
  return {
    message: 'An unexpected error occurred',
    status: 500,
    code: 'UNKNOWN_ERROR',
  };
}

