import { TimeoutError } from "./errors";

/**
 * Wrap a promise with a timeout
 *
 * @param promise - The promise to wrap
 * @param timeoutMs - Maximum time in milliseconds
 */
export function requestWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new TimeoutError("Request timeout")),
        timeoutMs
      )
    ),
  ]);
}
