import { useAuth } from "@/features/auth/hooks/useAuth"

export function useCurrentUser() {
  const { user, isAuthenticated, isLoadingUser } = useAuth()

  return {
    userId: user?.id ?? null,
    user,
    isAuthenticated,
    isLoading: isLoadingUser,
  }
}
