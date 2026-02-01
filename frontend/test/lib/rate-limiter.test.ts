import { describe, it, expect, beforeEach, vi } from "vitest";
import { RateLimiter, configureRateLimiter, resetRateLimiter, getRateLimiter } from "../../src/lib/rate-limiter";

describe("RateLimiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("should allow requests within rate limit", async () => {
    const rateLimiter = new RateLimiter({
      maxRequests: 5,
      windowMs: 1000,
    });

    const startTime = Date.now();

    // Make 5 requests - should all succeed without delay
    for (let i = 0; i < 5; i++) {
      await rateLimiter.waitForSlot();
    }

    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(100);
  });

  it("should throttle requests exceeding rate limit", async () => {
    const rateLimiter = new RateLimiter({
      maxRequests: 3,
      windowMs: 1000,
    });

    // Make 3 requests - should succeed immediately
    for (let i = 0; i < 3; i++) {
      await rateLimiter.waitForSlot();
    }

    // 4th request should wait
    const waitPromise = rateLimiter.waitForSlot();

    // Advance time by 500ms - should still be waiting
    vi.advanceTimersByTime(500);
    await Promise.resolve();

    expect(rateLimiter.getStatus().remaining).toBe(0);

    // Advance time by another 500ms - should now be available
    vi.advanceTimersByTime(500);
    await waitPromise;

    expect(rateLimiter.getStatus().remaining).toBeGreaterThan(0);
  });

  it("should respect minimum delay between requests", async () => {
    const rateLimiter = new RateLimiter({
      maxRequests: 100,
      windowMs: 1000,
      minDelayMs: 50,
    });

    const start = Date.now();
    await rateLimiter.waitForSlot();

    const waitPromise = rateLimiter.waitForSlot();
    vi.advanceTimersByTime(50);
    await waitPromise;

    const end = Date.now();

    expect(end - start).toBeGreaterThanOrEqual(50);
  });

  it("should return correct status", () => {
    const rateLimiter = new RateLimiter({
      maxRequests: 10,
      windowMs: 1000,
    });

    const status = rateLimiter.getStatus();
    expect(status.remaining).toBe(10);
    expect(status.limit).toBe(10);
  });

  it("should clean up old requests", async () => {
    const rateLimiter = new RateLimiter({
      maxRequests: 2,
      windowMs: 1000,
    });

    // Make 2 requests
    await rateLimiter.waitForSlot();
    await rateLimiter.waitForSlot();

    expect(rateLimiter.getStatus().remaining).toBe(0);

    // Advance time past the window
    vi.advanceTimersByTime(1100);

    // Should now have capacity again
    expect(rateLimiter.getStatus().remaining).toBe(2);
  });

  it("should reset correctly", async () => {
    const rateLimiter = new RateLimiter({
      maxRequests: 2,
      windowMs: 1000,
    });

    await rateLimiter.waitForSlot();
    await rateLimiter.waitForSlot();

    expect(rateLimiter.getStatus().remaining).toBe(0);

    rateLimiter.reset();

    expect(rateLimiter.getStatus().remaining).toBe(2);
  });
});

describe("Global rate limiter", () => {
  beforeEach(() => {
    resetRateLimiter();
  });

  it("should configure global rate limiter", () => {
    configureRateLimiter({
      maxRequests: 50,
      windowMs: 5000,
    });

    const rateLimiter = getRateLimiter();
    const status = rateLimiter.getStatus();

    expect(status.limit).toBe(50);
  });

  it("should return same instance", () => {
    const instance1 = getRateLimiter();
    const instance2 = getRateLimiter();

    expect(instance1).toBe(instance2);
  });

  it("should reset global rate limiter", async () => {
    const rateLimiter = getRateLimiter();

    await rateLimiter.waitForSlot();
    await rateLimiter.waitForSlot();

    resetRateLimiter();

    const status = rateLimiter.getStatus();
    expect(status.remaining).toBe(status.limit);
  });
});
