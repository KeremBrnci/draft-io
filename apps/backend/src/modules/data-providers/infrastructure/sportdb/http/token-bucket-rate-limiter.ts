/**
 * Simple rate limiter: enforces minimum interval between requests.
 */
export class TokenBucketRateLimiter {
  private lastRequestAt = 0;

  constructor(private readonly minIntervalMs: number) {}

  static fromRequestsPerSecond(rps: number): TokenBucketRateLimiter {
    const safeRps = rps > 0 ? rps : 1;
    return new TokenBucketRateLimiter(Math.ceil(1000 / safeRps));
  }

  async acquire(): Promise<void> {
    const now = Date.now();
    const waitMs = this.lastRequestAt + this.minIntervalMs - now;

    if (waitMs > 0) {
      await sleep(waitMs);
    }

    this.lastRequestAt = Date.now();
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
