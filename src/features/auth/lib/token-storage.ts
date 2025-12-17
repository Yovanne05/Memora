const TOKEN_STORAGE_KEY = "memora_access_token"

export function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null
  }
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

export function setAccessToken(token: string): void {
  if (typeof window === "undefined") {
    return
  }
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
  } catch {
    // localStorage may be unavailable; fail silently
  }
}

export function clearAccessToken(): void {
  if (typeof window === "undefined") {
    return
  }
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  } catch {
    // ignore storage errors
  }
}
