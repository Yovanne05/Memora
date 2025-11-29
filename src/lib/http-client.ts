import { ApiError } from "./errors";
import { addInterceptor, applyInterceptors } from "./interceptors";
import { isRetryable, getRetryDelay, delay } from "./retry-strategy";
import { parseError, normalizeError } from "./error-handler";
import { requestWithTimeout } from "./timeout";

const API_URL = import.meta.env.VITE_API_URL;

const DEFAULT_TIMEOUT = 10000; // 10 seconds
const DEFAULT_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000; // 1 second
const DEFAULT_RETRY_MULTIPLIER = 2; // Exponential backoff

export interface HttpClient {
  get<T>(path: string): Promise<T>;
  post<T, B = unknown>(path: string, body?: B): Promise<T>;
  patch<T, B = unknown>(path: string, body?: B): Promise<T>;
  delete<T>(path: string): Promise<T>;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const config = await applyInterceptors(init || {});

    const response = await requestWithTimeout(
      fetch(`${API_URL}${path}`, config),
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
    normalizeError(error);
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
      const backoffDelay = getRetryDelay(
        attempt,
        DEFAULT_RETRY_DELAY,
        DEFAULT_RETRY_MULTIPLIER
      );
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

export { addInterceptor };
