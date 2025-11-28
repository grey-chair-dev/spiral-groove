import { describe, it, expect, vi } from 'vitest';
import { withRetry } from '@/lib/utils/retry';

describe('withRetry', () => {
  it('retries on failure until success', async () => {
    const task = vi.fn()
      .mockRejectedValueOnce(new Error('fail once'))
      .mockResolvedValue('ok');

    const result = await withRetry(task, {
      retries: 3,
      baseDelayMs: 0,
      maxDelayMs: 0,
    });

    expect(result).toBe('ok');
    expect(task).toHaveBeenCalledTimes(2);
  });

  it('stops immediately for non-retryable errors', async () => {
    const error = new Error('boom');
    const task = vi.fn().mockRejectedValue(error);

    await expect(
      withRetry(task, {
        retries: 3,
        baseDelayMs: 0,
        maxDelayMs: 0,
        shouldRetry: () => false,
      })
    ).rejects.toThrow('boom');

    expect(task).toHaveBeenCalledTimes(1);
  });
});


