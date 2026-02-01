import { renderHook, act } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { vi } from "vitest"
import { useCreateCollectionMutation } from "@/features/collections/hooks/useCreateCollectionMutation"
import { COLLECTIONS_QUERY_KEYS } from "@/features/collections/hooks/collections.keys"
import type { Collection } from "@/features/collections/models/collection.model"
import type { PaginatedCollections } from "@/features/collections/types/paginated-collection"

const mockCollectionsService = vi.hoisted(() => ({
  create: vi.fn(),
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

describe("useCreateCollectionMutation", () => {
  test("creates a collection and updates cache", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    const newCollection: Collection = {
      id: "col-new",
      ownerId: "owner-1",
      name: "New Collection",
      description: "New Description",
      visibility: "private",
      tags: [],
      notes: [],
      nodes: [],
      edges: [],
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    }

    const existingCollection = { ...newCollection, id: "col-1", name: "Existing" }

    mockCollectionsService.create.mockResolvedValue(newCollection)

    const listKey = COLLECTIONS_QUERY_KEYS.lists()
    const initialList: PaginatedCollections = {
      items: [existingCollection],
      total: 1,
      limit: 10,
      offset: 0,
    }
    queryClient.setQueryData(listKey, initialList)

    const { result } = renderHook(
      () => useCreateCollectionMutation({ silent: true }),
      { wrapper: createWrapper(queryClient) }
    )

    await act(async () => {
      await result.current.mutateAsync({
        ownerId: "owner-1",
        name: "New Collection",
        description: "New Description",
        visibility: "private",
      })
    })

    expect(mockCollectionsService.create).toHaveBeenCalledWith({
      ownerId: "owner-1",
      name: "New Collection",
      description: "New Description",
      visibility: "private",
    })

    const listData = queryClient.getQueryData(listKey)
    expect(listData).toEqual(newCollection)
    expect(
      queryClient.getQueryData(COLLECTIONS_QUERY_KEYS.detail(newCollection.id))
    ).toEqual(newCollection)
  })
})
