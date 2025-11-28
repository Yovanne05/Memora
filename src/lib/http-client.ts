const API_URL = import.meta.env.VITE_API_URL

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

export interface HttpClient {
  get<T>(path: string): Promise<T>
  post<T, B = unknown>(path: string, body?: B): Promise<T>
  patch<T, B = unknown>(path: string, body?: B): Promise<T>
  delete<T>(path: string): Promise<T>
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { message?: string; error?: string }
    return data?.message || data?.error || `Request failed with status ${response.status}`
  } catch {
    return `Request failed with status ${response.status}`
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, init)

  if (!response.ok) {
    throw new ApiError(await parseError(response), response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export function createHttpClient(): HttpClient {
  return {
    get: (path) => request(path, { method: "GET" }),
    post: (path, body) =>
      request(path, {
        method: "POST",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      }),
    patch: (path, body) =>
      request(path, {
        method: "PATCH",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      }),
    delete: (path) =>
      request(path, {
        method: "DELETE",
      }),
  }
}

export const httpClient = createHttpClient()
