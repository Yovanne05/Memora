import { renderHook } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { vi } from "vitest"
import { useUserSearchQuery } from "@/features/users/hooks/useUserSearchQuery"

const mockUsersService = vi.hoisted(() => ({
  list: vi.fn(),
}))

vi.mock("@/features/users/services/users.service", () => ({
  usersService: mockUsersService,
}))

const createWrapper = (client: QueryClient) => {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
}

describe("useUserSearchQuery", () => {
  test("does not fetch when query is too short", () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    const { result } = renderHook(() => useUserSearchQuery("a"), {
      wrapper: createWrapper(queryClient),
    })

    expect(result.current.isFetching).toBe(false)
    expect(mockUsersService.list).not.toHaveBeenCalled()
  })
})
