import { useCallback, useEffect, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { ApiError } from "@/lib/errors"
import { clearAccessToken, getAccessToken, setAccessToken } from "../lib/token-storage"
import type { LoginPayload, RegisterPayload } from "../models/auth.model"
import { authService } from "../services/auth.service"

const AUTH_USER_QUERY_KEY = ["auth", "user"] as const

export function useAuth() {
  const queryClient = useQueryClient()
  const [token, setToken] = useState<string | null>(() => getAccessToken())

  const syncToken = useCallback((nextToken: string | null) => {
    if (nextToken) {
      setAccessToken(nextToken)
    } else {
      clearAccessToken()
    }
    setToken(nextToken)
  }, [])

  useEffect(() => {
    const handleStorage = () => setToken(getAccessToken())
    globalThis.window.addEventListener("storage", handleStorage)
    return () => globalThis.window.removeEventListener("storage", handleStorage)
  }, [])

  useEffect(() => {
    if (!token) {
      queryClient.removeQueries({ queryKey: AUTH_USER_QUERY_KEY })
    }
  }, [token, queryClient])

  const userQuery = useQuery({
    queryKey: AUTH_USER_QUERY_KEY,
    queryFn: () => authService.getProfile(),
    enabled: Boolean(token),
    retry: false,
  })

  useEffect(() => {
    if (userQuery.error instanceof ApiError && userQuery.error.status === 401) {
      syncToken(null)
    }
  }, [userQuery.error, syncToken])

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: ({ accessToken, user }) => {
      syncToken(accessToken)
      queryClient.setQueryData(AUTH_USER_QUERY_KEY, user)
    },
  })

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
  })

  const logout = useCallback(async () => {
    try {
      if (token) {
        await authService.logout()
      }
    } catch (error) {
      console.warn("Logout request failed, cleaning up client-side token only.", error)
    } finally {
      syncToken(null)
      queryClient.removeQueries({ queryKey: AUTH_USER_QUERY_KEY })
    }
  }, [queryClient, syncToken, token])

  const authError = useMemo(
    () => userQuery.error ?? loginMutation.error ?? registerMutation.error,
    [loginMutation.error, registerMutation.error, userQuery.error]
  )

  return {
    user: userQuery.data ?? null,
    token,
    isAuthenticated: Boolean(token),
    isLoadingUser: userQuery.isLoading && Boolean(token),
    authError,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  }
}
