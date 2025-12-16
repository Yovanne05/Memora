import React from "react"
import { renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { vi } from "vitest"
import { COLLECTIONS_QUERY_KEYS } from "@/features/collections/hooks/collections.keys"
import { useCollectionQuery } from "@/features/collections/hooks/useCollectionQuery"
import { useCollectionsListQuery } from "@/features/collections/hooks/useCollectionsListQuery"
import { useCreateCollectionMutation } from "@/features/collections/hooks/useCreateCollectionMutation"
import { useUpdateCollectionMutation } from "@/features/collections/hooks/useUpdateCollectionMutation"
import { useDeleteCollectionMutation } from "@/features/collections/hooks/useDeleteCollectionMutation"
import type { Collection } from "@/features/collections/models/collection.model"

const mockCollectionsService = vi.hoisted(() => ({
  list: vi.fn(),
  get: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}))

vi.mock("@/features/collections/services/collections.service", () => ({
  collectionsService: mockCollectionsService,
}))

const createWrapper = (client: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
}

describe("useCollectionsQuery hooks", () => {
  let queryClient: QueryClient

  const collection: Collection = {
    id: "col-1",
    ownerId: "owner",
    name: "Titre",
    description: "Desc",
    visibility: "private",
    notes: [],
    tags: [],
    nodes: [],
    edges: [],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
  }

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
  })

  test("useCollectionsListQuery recupere les collections via le service", async () => {
    mockCollectionsService.list.mockResolvedValue([collection])
    const { result } = renderHook(() => useCollectionsListQuery(), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([collection])
    expect(mockCollectionsService.list).toHaveBeenCalledTimes(1)
  })

  test("useCollectionQuery recupere le detail", async () => {
    mockCollectionsService.get.mockResolvedValue(collection)
    const { result } = renderHook(() => useCollectionQuery("col-1"), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => expect(result.current.data).toEqual(collection))
    expect(mockCollectionsService.get).toHaveBeenCalledWith("col-1")
  })

  test("useCreateCollectionMutation met a jour le cache liste", async () => {
    const newCollection = { ...collection, id: "col-2" }
    mockCollectionsService.create.mockResolvedValue(newCollection)
    queryClient.setQueryData(COLLECTIONS_QUERY_KEYS.list(), {
      items: [collection],
      total: 1,
      offset: 0,
      limit: 10,
    })

    const { result } = renderHook(() => useCreateCollectionMutation(), {
      wrapper: createWrapper(queryClient),
    })

    await result.current.mutateAsync({
      ownerId: "owner",
      name: "Titre",
      description: "Desc",
      visibility: "private",
    })

    const cached = queryClient.getQueryData<{ items: Collection[], total: number }>(COLLECTIONS_QUERY_KEYS.list())
    expect(cached?.items[0]).toEqual(newCollection)
    expect(cached?.total).toBe(2)
  })

  test("useUpdateCollectionMutation remplace la collection dans le cache liste et detail", async () => {
    const updated = { ...collection, name: "Maj" }
    mockCollectionsService.update.mockResolvedValue(updated)
    queryClient.setQueryData(COLLECTIONS_QUERY_KEYS.list(), {
      items: [collection],
      total: 1,
      offset: 0,
      limit: 10,
    })
    queryClient.setQueryData(COLLECTIONS_QUERY_KEYS.detail(collection.id), collection)

    const { result } = renderHook(() => useUpdateCollectionMutation(), {
      wrapper: createWrapper(queryClient),
    })

    await result.current.mutateAsync({ id: collection.id, data: { name: "Maj" } })

    const cached = queryClient.getQueryData<{ items: Collection[] }>(COLLECTIONS_QUERY_KEYS.list())
    expect(cached?.items).toEqual([updated])
    expect(
      queryClient.getQueryData<Collection>(COLLECTIONS_QUERY_KEYS.detail(collection.id))
    ).toEqual(updated)
  })

  test("useDeleteCollectionMutation retire la collection du cache", async () => {
    mockCollectionsService.remove.mockResolvedValue(undefined)
    queryClient.setQueryData(COLLECTIONS_QUERY_KEYS.list(), {
      items: [collection],
      total: 1,
      offset: 0,
      limit: 10,
    })
    queryClient.setQueryData(COLLECTIONS_QUERY_KEYS.detail(collection.id), collection)

    const { result } = renderHook(() => useDeleteCollectionMutation(), {
      wrapper: createWrapper(queryClient),
    })

    await result.current.mutateAsync(collection.id)

    const cached = queryClient.getQueryData<{ items: Collection[], total: number }>(COLLECTIONS_QUERY_KEYS.list())
    expect(cached?.items).toEqual([])
    expect(cached?.total).toBe(0)
    expect(
      queryClient.getQueryData(COLLECTIONS_QUERY_KEYS.detail(collection.id))
    ).toBeUndefined()
  })
})
