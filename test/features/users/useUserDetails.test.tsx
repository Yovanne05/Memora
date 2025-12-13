import { renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { vi } from "vitest"
import { useUserDetails } from "@/features/users/hooks/useUserDetails"
import type { User } from "@/features/users/models/user.model"
import React from "react"

const mockUsersService = vi.hoisted(() => ({
  get: vi.fn(),
}))

vi.mock("@/features/users/services/users.service", () => ({
  usersService: mockUsersService,
}))

const createWrapper = (client: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
}

describe("useUserDetails", () => {
  let queryClient: QueryClient

  const user: User = {
    id: "user-1",
    username: "testuser",
    email: "test@example.com",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
  }

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
  })

  test("charge l'utilisateur avec un ID valide", async () => {
    mockUsersService.get.mockResolvedValue(user)

    const { result } = renderHook(() => useUserDetails("user-1"), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(user)
    expect(mockUsersService.get).toHaveBeenCalledWith("user-1")
  })

  test("est désactivé si userId est undefined", () => {
    const { result } = renderHook(() => useUserDetails(undefined), {
      wrapper: createWrapper(queryClient),
    })

    expect(result.current.isPending).toBe(true)
    expect(mockUsersService.get).not.toHaveBeenCalled()
  })

  test("cache les données pendant 5 minutes", async () => {
    mockUsersService.get.mockResolvedValue(user)

    const { result } = renderHook(() => useUserDetails("user-1"), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(user)
  })

  test("gère les erreurs correctement", async () => {
    const error = new Error("User not found")
    mockUsersService.get.mockRejectedValue(error)

    const { result } = renderHook(() => useUserDetails("user-invalid"), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeTruthy()
  })
})
