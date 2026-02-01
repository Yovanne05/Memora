import { renderHook, act } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { vi } from "vitest"
import { useUpdateCollectionMutation } from "@/features/collections/hooks/useUpdateCollectionMutation"
import { COLLECTIONS_QUERY_KEYS } from "@/features/collections/hooks/collections.keys"
import type { Collection } from "@/features/collections/models/collection.model"
import type { PaginatedCollections } from "@/features/collections/types/paginated-collection"

const mockCollectionsService = vi.hoisted(() => ({
  update: vi.fn(),
}))

vi.mock("@/features/collections/services/collections.service", () => ({
  collectionsService: mockCollectionsService,
}))

vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn() },
}))

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const createWrapper = (client: QueryClient) => {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
}

describe("useUpdateCollectionMutation", () => {
  test("updates collection in cache", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    const collection: Collection = {
      id: "col-1",
      ownerId: "owner",
      name: "Original",
      description: "Desc",
      visibility: "private",
      tags: [],
      notes: [],
      nodes: [],
      edges: [],
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-02T00:00:00.000Z",
    }

    const updated = { ...collection, name: "Updated" }
    mockCollectionsService.update.mockResolvedValue(updated)

    const listKey = COLLECTIONS_QUERY_KEYS.list()
    const detailKey = COLLECTIONS_QUERY_KEYS.detail(collection.id)
    const listData: PaginatedCollections = {
      items: [collection],
      total: 1,
      limit: 10,
      offset: 0,
    }

    queryClient.setQueryData(listKey, listData)
    queryClient.setQueryData(detailKey, collection)

    const { result } = renderHook(
      () => useUpdateCollectionMutation({ silent: true }),
      { wrapper: createWrapper(queryClient) }
    )

    await act(async () => {
      await result.current.mutateAsync({
        id: collection.id,
        data: { name: "Updated" },
      })
    })

    expect(mockCollectionsService.update).toHaveBeenCalledWith("col-1", {
      name: "Updated",
    })

    const updatedList = queryClient.getQueryData<PaginatedCollections>(listKey)
    expect(updatedList?.items[0]).toEqual(updated)
    expect(queryClient.getQueryData(detailKey)).toEqual(updated)
  })
})
