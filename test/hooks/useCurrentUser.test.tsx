import { renderHook } from "@testing-library/react"
import { vi } from "vitest"
import { useCurrentUser } from "@/hooks/useCurrentUser"

const useAuthMock = vi.hoisted(() => vi.fn())

vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => useAuthMock(),
}))

describe("useCurrentUser", () => {
  beforeEach(() => {
    useAuthMock.mockReset()
  })

  test("expose les informations de l'utilisateur courant issues de l'auth", () => {
    useAuthMock.mockReturnValue({
      user: {
        id: "user-123",
        email: "john.doe@example.com",
        username: "johndoe",
        displayName: "John Doe",
        role: "client",
        createdAt: "2024-01-01T00:00:00Z",
        lastLogin: "2024-02-01T00:00:00Z",
      },
      isAuthenticated: true,
      isLoadingUser: false,
    })

    const { result } = renderHook(() => useCurrentUser())

    expect(result.current.userId).toBe("user-123")
    expect(result.current.user).toMatchObject({ id: "user-123", email: "john.doe@example.com" })
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isLoading).toBe(false)
  })

  test("retourne un userId nul lorsque l'utilisateur n'est pas disponible", () => {
    useAuthMock.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoadingUser: true,
    })

    const { result } = renderHook(() => useCurrentUser())

    expect(result.current.userId).toBeNull()
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isLoading).toBe(true)
  })
})
