import { ApiError, TimeoutError, NetworkError } from "./errors";
import { logger } from "./logger"

const DEFAULT_RETRY_DELAY = 1000; // 1 second
const DEFAULT_RETRY_DELAY_MULTIPLIER = 2; // Exponential backoff

const RETRYABLE_METHODS = ["GET", "HEAD", "OPTIONS", "DELETE"];
const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

export function isIdempotent(method: string): boolean {
  return RETRYABLE_METHODS.includes(method.toUpperCase());
}

/**
 * Determine if an error should trigger a retry
 *
 * @param error - The error that occurred
 * @param method - The HTTP method used
 * @param retriesRemaining - Number of retries left
 */
export function isRetryable(
  error: unknown,
  method: string,
  retriesRemaining: number
): boolean {
  if (!isIdempotent(method)) {
    if (retriesRemaining > 0) {
      logger.warn(
        `Non-idempotent method ${method.toUpperCase()} failed, not retrying. ` +
          `Retry mechanism is disabled for non-idempotent requests to prevent duplicate operations.`
      );
    }
    return false;
  }

  if (error instanceof ApiError) {
    return RETRYABLE_STATUS_CODES.includes(error.status);
  }

  if (error instanceof TimeoutError || error instanceof NetworkError) {
    return true;
  }

  return false;
}

/**
 * Calculate exponential backoff delay
 *
 * @param attempt - Current attempt number (1-indexed)
 * @param baseDelay - Base delay in milliseconds
 * @param multiplier - Exponential backoff multiplier
 */
export function getRetryDelay(
  attempt: number,
  baseDelay: number = DEFAULT_RETRY_DELAY,
  multiplier: number = DEFAULT_RETRY_DELAY_MULTIPLIER
): number {
  return baseDelay * Math.pow(multiplier, attempt - 1);
}

export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
