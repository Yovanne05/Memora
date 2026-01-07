import { logger } from "./logger";
interface RateLimiterConfig {
  maxRequests: number;
  windowMs: number;
  minDelayMs?: number;
}

interface RequestRecord {
  timestamp: number;
}

class RateLimiter {
  private requests: RequestRecord[] = [];
  private readonly config: Required<RateLimiterConfig>;
  private lastRequestTime: number = 0;

  constructor(config: RateLimiterConfig) {
    this.config = {
      maxRequests: config.maxRequests,
      windowMs: config.windowMs,
      minDelayMs: config.minDelayMs || 0,
    };
  }

  async waitForSlot(): Promise<void> {
    const now = Date.now();

    this.requests = this.requests.filter(
      (record) => now - record.timestamp < this.config.windowMs
    );

    if (this.config.minDelayMs > 0) {
      const timeSinceLastRequest = now - this.lastRequestTime;
      if (timeSinceLastRequest < this.config.minDelayMs) {
        const delay = this.config.minDelayMs - timeSinceLastRequest;
        await this.sleep(delay);
      }
    }

    if (this.requests.length >= this.config.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.config.windowMs - (Date.now() - oldestRequest.timestamp);

      if (waitTime > 0) {
        logger.debug(`Rate limit reached. Waiting ${waitTime}ms before next request.`);
        await this.sleep(waitTime);
        this.requests = this.requests.filter(
          (record) => Date.now() - record.timestamp < this.config.windowMs
        );
      }
    }

    this.requests.push({ timestamp: Date.now() });
    this.lastRequestTime = Date.now();
  }

  getStatus() {
    const now = Date.now();
    const activeRequests = this.requests.filter(
      (record) => now - record.timestamp < this.config.windowMs
    );

    return {
      remaining: Math.max(0, this.config.maxRequests - activeRequests.length),
      limit: this.config.maxRequests,
      resetAt: activeRequests.length > 0
        ? activeRequests[0].timestamp + this.config.windowMs
        : now,
    };
  }

  reset(): void {
    this.requests = [];
    this.lastRequestTime = 0;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

const DEFAULT_CONFIG: RateLimiterConfig = {
  maxRequests: 100,        // Max requests per window
  windowMs: 60 * 1000,     // 1 minute window
  minDelayMs: 10,          // 10ms minimum delay between requests
};

let globalRateLimiter: RateLimiter | null = null;


export function getRateLimiter(config?: RateLimiterConfig): RateLimiter {
  globalRateLimiter ??= new RateLimiter(config || DEFAULT_CONFIG);
  return globalRateLimiter;
}

export function configureRateLimiter(config: RateLimiterConfig): void {
  globalRateLimiter = new RateLimiter(config);
}

export function resetRateLimiter(): void {
  if (globalRateLimiter) {
    globalRateLimiter.reset();
  }
}

export { RateLimiter, type RateLimiterConfig };
