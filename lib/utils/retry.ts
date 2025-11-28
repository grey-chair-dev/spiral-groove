/**
 * Generic retry helper with exponential backoff.
 */

export interface RetryOptions {
  retries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  factor?: number;
  shouldRetry?: (error: unknown) => boolean;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  retries: 3,
  baseDelayMs: 250,
  maxDelayMs: 2000,
  factor: 2,
  shouldRetry: () => true,
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  const {
    retries,
    baseDelayMs,
    maxDelayMs,
    factor,
    shouldRetry,
  } = { ...DEFAULT_OPTIONS, ...options };

  let attempt = 0;
  let lastError: unknown;

  while (attempt < retries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      attempt += 1;

      const retryable = shouldRetry?.(error);
      if (!retryable || attempt >= retries) {
        throw error;
      }

      const backoff = Math.min(
        baseDelayMs * Math.pow(factor, attempt - 1),
        maxDelayMs
      );
      const jitter = backoff * (0.5 + Math.random() * 0.5);
      await sleep(jitter);
    }
  }

  throw lastError;
}

/**
 * Heuristic for retrying ECS API errors.
 */
export function shouldRetryECSError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return true;
  }

  const status =
    (error as any).statusCode ??
    (error as any).response?.statusCode ??
    (error as any).status ??
    (error as any).code;

  if (typeof status === 'number') {
    return status === 429 || status >= 500;
  }

  const errorCode = (error as any).code;
  if (typeof errorCode === 'string') {
    return ['ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN'].includes(errorCode);
  }

  return true;
}

export function withECSRetry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  return withRetry(fn, {
    shouldRetry: shouldRetryECSError,
    ...options,
  });
}


