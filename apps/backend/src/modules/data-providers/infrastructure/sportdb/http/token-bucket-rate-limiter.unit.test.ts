import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TokenBucketRateLimiter } from './token-bucket-rate-limiter';

describe('TokenBucketRateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('enforces minimum interval between acquisitions', async () => {
    const limiter = new TokenBucketRateLimiter(500);

    const first = limiter.acquire();
    await vi.advanceTimersByTimeAsync(0);
    await first;

    const second = limiter.acquire();
    const pending = vi.advanceTimersByTimeAsync(499);
    await Promise.race([second, pending]);
    await vi.advanceTimersByTimeAsync(1);
    await second;

    expect(vi.getTimerCount()).toBe(0);
  });
});
