import { renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { vi } from "vitest"
import { useCollectionsQuery } from "@/features/collections/hooks/useCollectionsQuery"
import type { PaginatedCollections } from "@/features/collections/types/paginated-collection"

const mockCollectionsService = vi.hoisted(() => ({
  list: vi.fn(),
}))

vi.mock("@/features/collections/services/collections.service", () => ({
  collectionsService: mockCollectionsService,
}))

const createWrapper = (client: QueryClient) => {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
}

describe("useCollectionsQuery", () => {
  test("fetches collections with params", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })

    const response: PaginatedCollections = {
      items: [],
      total: 0,
      limit: 10,
      offset: 0,
    }

    mockCollectionsService.list.mockResolvedValue(response)

    const params = { ownerId: "owner-1", limit: 10 }
    const { result } = renderHook(() => useCollectionsQuery(params), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(response)
    expect(mockCollectionsService.list).toHaveBeenCalledWith(params)
  })
})
