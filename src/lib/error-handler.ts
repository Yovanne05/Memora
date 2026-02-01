import { ApiError, NetworkError, TimeoutError } from "./errors";

export async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as {
      message?: string;
      error?: string;
      detail?: unknown;
    };

    const detail = normalizeDetail(data?.detail);
    if (detail) return detail;

    return (
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`
    );
  } catch {
    return `Request failed with status ${response.status}`;
  }
}

interface ValidationError {
  msg: string;
  loc?: unknown[];
}

interface ErrorWithMessage {
  message?: string;
  msg?: string;
}

function normalizeDetail(detail: unknown): string | null {
  if (!detail) return null;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "msg" in item) {
          const validationError = item as ValidationError;
          const path = Array.isArray(validationError.loc)
            ? validationError.loc.join(".")
            : undefined;
          return path ? `${path}: ${validationError.msg}` : String(validationError.msg);
        }
        return null;
      })
      .filter(Boolean)
      .join(" | ") || null;
  }

  if (typeof detail === "object" && detail !== null) {
    const errorObj = detail as ErrorWithMessage;
    if ("message" in errorObj && typeof errorObj.message === "string") {
      return errorObj.message;
    }
    if ("msg" in errorObj && typeof errorObj.msg === "string") {
      return errorObj.msg;
    }
  }

  return null;
}

export function normalizeError(error: unknown): never {
  if (error instanceof TimeoutError) {
    throw error;
  }

  if (error instanceof ApiError) {
    throw error;
  }

  if (error instanceof NetworkError) {
    throw error;
  }

  if (error instanceof Error && error.message.includes("fetch")) {
    throw new NetworkError("Network request failed", error);
  }

  throw error;
}
