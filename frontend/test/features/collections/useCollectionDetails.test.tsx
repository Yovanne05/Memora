import { renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { vi } from "vitest"
import { useCollectionQuery } from "@/features/collections/hooks/useCollectionQuery"
import type { Collection } from "@/features/collections/models/collection.model"

const mockCollectionsService = vi.hoisted(() => ({
  get: vi.fn(),
}))

vi.mock("@/features/collections/services/collections.service", () => ({
  collectionsService: mockCollectionsService,
}))

const createWrapper = (client: QueryClient) => {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
}

describe("useCollectionQuery", () => {
  test("fetches a collection by id", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    const collection: Collection = {
      id: "col-1",
      ownerId: "owner",
      name: "Collection",
      description: "Desc",
      visibility: "private",
      tags: [],
      notes: [],
      nodes: [],
      edges: [],
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-02T00:00:00.000Z",
    }

    mockCollectionsService.get.mockResolvedValue(collection)

    const { result } = renderHook(() => useCollectionQuery("col-1"), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(collection)
    expect(mockCollectionsService.get).toHaveBeenCalledWith("col-1")
  })

  test("does not fetch when disabled", () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    const { result } = renderHook(
      () => useCollectionQuery("", { enabled: true }),
      { wrapper: createWrapper(queryClient) }
    )

    expect(result.current.isFetching).toBe(false)
    expect(mockCollectionsService.get).not.toHaveBeenCalled()
  })
})
