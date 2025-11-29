import { ApiError, NetworkError, TimeoutError } from "./errors";

export async function parseError(response: Response): Promise<string> {
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
