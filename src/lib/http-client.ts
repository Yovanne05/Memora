import { ApiError } from "./errors";
import { applyInterceptors } from "./interceptors";
import { isRetryable, getRetryDelay, delay } from "./retry-strategy";
import { parseError, normalizeError } from "./error-handler";
import { requestWithTimeout } from "./timeout";
import { config } from "./config";
import { getRateLimiter } from "./rate-limiter";

const DEFAULT_TIMEOUT = 10000; // 10 seconds
const DEFAULT_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000; // 1 second
const DEFAULT_RETRY_MULTIPLIER = 2; // Exponential backoff

export interface HttpClient {
  get<T>(path: string, options?: HttpRequestOptions): Promise<T>;
  post<T, B = unknown>(path: string, body?: B, options?: HttpRequestOptions): Promise<T>;
  patch<T, B = unknown>(path: string, body?: B, options?: HttpRequestOptions): Promise<T>;
  delete<T>(path: string, options?: HttpRequestOptions): Promise<T>;
}

type ParamValue = string | number | boolean;
type ParamArrayValue = Array<ParamValue>;
type ParamValueOrArray = ParamValue | ParamArrayValue | null | undefined;

export interface HttpRequestOptions {
  params?: Record<string, ParamValueOrArray>;
}

function isValidValue(value: unknown): value is ParamValue {
  return value !== undefined && value !== null;
}

function appendParamValue(
  searchParams: URLSearchParams,
  key: string,
  value: ParamValue | ParamArrayValue
): void {
  if (Array.isArray(value)) {
    value.filter(isValidValue).forEach((v) => {
      searchParams.append(key, String(v));
    });
  } else {
    searchParams.append(key, String(value));
  }
}

function buildPathWithParams(path: string, params?: HttpRequestOptions["params"]): string {
  if (!params) return path;

  const searchParams = new URLSearchParams();

  Object.entries(params)
    .filter(([, value]) => isValidValue(value))
    .forEach(([key, value]) => {
      appendParamValue(searchParams, key, value!);
    });

  const query = searchParams.toString();
  if (!query) return path;

  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}${query}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const rateLimiter = getRateLimiter();
    await rateLimiter.waitForSlot();

    const requestConfig = await applyInterceptors(init || {});
    const response = await requestWithTimeout(
      fetch(`${config.apiUrl}${path}`, requestConfig),
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
    throw normalizeError(error);
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
    get: (path, options) =>
      requestWithRetry(buildPathWithParams(path, options?.params), {
        method: "GET",
      }),

    post: (path, body, options) =>
      requestWithRetry(buildPathWithParams(path, options?.params), {
        method: "POST",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      }),

    patch: (path, body, options) =>
      requestWithRetry(buildPathWithParams(path, options?.params), {
        method: "PATCH",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      }),

    delete: (path, options) =>
      requestWithRetry(buildPathWithParams(path, options?.params), {
        method: "DELETE",
      }),
  };
}

export const httpClient = createHttpClient();

export { addInterceptor } from "./interceptors";
export { configureRateLimiter, resetRateLimiter } from "./rate-limiter";
export type { RateLimiterConfig } from "./rate-limiter";
