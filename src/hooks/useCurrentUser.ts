import { config } from "@/lib/config"

export function useCurrentUser() {
  const userId = config.userHook ?? null

  return {
    userId,
    user: null,
    isAuthenticated: Boolean(userId),
    isLoading: false,
  }
}
