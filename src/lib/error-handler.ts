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
          const path = Array.isArray((item as any).loc)
            ? (item as any).loc.join(".")
            : undefined;
          return path ? `${path}: ${(item as any).msg}` : String((item as any).msg);
        }
        return null;
      })
      .filter(Boolean)
      .join(" | ") || null;
  }

  if (typeof detail === "object" && detail !== null) {
    if ("message" in detail && typeof (detail as any).message === "string") {
      return (detail as any).message;
    }
    if ("msg" in detail && typeof (detail as any).msg === "string") {
      return (detail as any).msg;
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
