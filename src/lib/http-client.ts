import { ApiError, TimeoutError, NetworkError } from "./errors";

const API_URL = import.meta.env.VITE_API_URL;

const DEFAULT_TIMEOUT = 10000; // 10 seconds
const DEFAULT_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const RETRY_DELAY_MULTIPLIER = 2; // backoff

const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

const RETRYABLE_METHODS = ["GET", "HEAD", "OPTIONS", "DELETE"];

export interface HttpClient {
  get<T>(path: string): Promise<T>;
  post<T, B = unknown>(path: string, body?: B): Promise<T>;
  patch<T, B = unknown>(path: string, body?: B): Promise<T>;
  delete<T>(path: string): Promise<T>;
}

function isIdempotent(method: string): boolean {
  return RETRYABLE_METHODS.includes(method.toUpperCase());
}

function isRetryable(error: unknown, method: string, retries: number): boolean {
  if (!isIdempotent(method)) {
    if (retries > 0) {
      console.warn(
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

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function requestWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new TimeoutError("Request timeout")), timeoutMs)
    ),
  ]);
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as {
      message?: string;
      error?: string;
    };
    return (
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`
    );
  } catch {
    return `Request failed with status ${response.status}`;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const response = await requestWithTimeout(
      fetch(`${API_URL}${path}`, init),
      DEFAULT_TIMEOUT
    );

    if (!response.ok) {
      throw new ApiError(await parseError(response), response.status);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof TimeoutError) {
      throw error;
    }

    if (error instanceof Error && error.message.includes("fetch")) {
      throw new NetworkError("Network request failed", error);
    }

    throw error;
  }
}

async function requestWithRetry<T>(
  path: string,
  init?: RequestInit,
  retries: number = DEFAULT_RETRIES,
  attempt: number = 1
): Promise<T> {
  try {
    return await request<T>(path, init);
  } catch (error) {
    const method = init?.method || "GET";

    if (retries > 0 && isRetryable(error, method, retries)) {
      const backoffDelay =
        RETRY_DELAY * Math.pow(RETRY_DELAY_MULTIPLIER, attempt - 1);
      await delay(backoffDelay);
      return requestWithRetry<T>(path, init, retries - 1, attempt + 1);
    }

    throw error;
  }
}

export function createHttpClient(): HttpClient {
  return {
    get: (path) => requestWithRetry(path, { method: "GET" }),
    post: (path, body) =>
      requestWithRetry(path, {
        method: "POST",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      }),
    patch: (path, body) =>
      requestWithRetry(path, {
        method: "PATCH",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      }),
    delete: (path) =>
      requestWithRetry(path, {
        method: "DELETE",
      }),
  };
}

export const httpClient = createHttpClient();
