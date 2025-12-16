export function useCurrentUser() {
  const { user, isAuthenticated, isLoadingUser } = useAuth()

  return {
    userId: user?.id ?? null,
    user,
    isAuthenticated,
    isLoading: isLoadingUser,
  }
}
import { useAuth } from "@/features/auth/hooks/useAuth"
