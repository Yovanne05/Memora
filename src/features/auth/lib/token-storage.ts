const TOKEN_STORAGE_KEY = 'memora_access_token'

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

function decodeJWT(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }
    const payload = parts[1]
    const decoded = atob(payload.replaceAll('-', '+').replaceAll('_', '/'))
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

export function getCurrentUserId(): string | null {
  const token = getAccessToken()
  if (!token) {
    return null
  }
  const decoded = decodeJWT(token)
  return decoded?.sub as string | null
}

export function setAccessToken(token: string): void {
  if (typeof window === 'undefined') {
    return
  }
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
  } catch {
    // localStorage may be unavailable; fail silently
  }
}

export function clearAccessToken(): void {
  if (typeof window === 'undefined') {
    return
  }
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  } catch {
    // ignore storage errors
  }
}
