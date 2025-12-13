import React from "react"
import { renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { vi } from "vitest"
import {
  COLLECTIONS_QUERY_KEYS,
  useCollectionQuery,
  useCollectionsListQuery,
  useCreateCollectionMutation,
  useUpdateCollectionMutation,
  useDeleteCollectionMutation,
} from "@/features/collections/hooks/useCollectionsQuery"
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
    queryClient.setQueryData(COLLECTIONS_QUERY_KEYS.list(), [collection])

    const { result } = renderHook(() => useCreateCollectionMutation(), {
      wrapper: createWrapper(queryClient),
    })

    await result.current.mutateAsync({
      ownerId: "owner",
      name: "Titre",
      description: "Desc",
      visibility: "private",
    })

    const cached = queryClient.getQueryData<Collection[]>(COLLECTIONS_QUERY_KEYS.list())
    expect(cached?.[0]).toEqual(newCollection)
  })

  test("useUpdateCollectionMutation remplace la collection dans le cache liste et detail", async () => {
    const updated = { ...collection, name: "Maj" }
    mockCollectionsService.update.mockResolvedValue(updated)
    queryClient.setQueryData(COLLECTIONS_QUERY_KEYS.list(), [collection])
    queryClient.setQueryData(COLLECTIONS_QUERY_KEYS.detail(collection.id), collection)

    const { result } = renderHook(() => useUpdateCollectionMutation(), {
      wrapper: createWrapper(queryClient),
    })

    await result.current.mutateAsync({ id: collection.id, data: { name: "Maj" } })

    expect(
      queryClient.getQueryData<Collection[]>(COLLECTIONS_QUERY_KEYS.list())
    ).toEqual([updated])
    expect(
      queryClient.getQueryData<Collection>(COLLECTIONS_QUERY_KEYS.detail(collection.id))
    ).toEqual(updated)
  })

  test("useDeleteCollectionMutation retire la collection du cache", async () => {
    mockCollectionsService.remove.mockResolvedValue(undefined)
    queryClient.setQueryData(COLLECTIONS_QUERY_KEYS.list(), [collection])
    queryClient.setQueryData(COLLECTIONS_QUERY_KEYS.detail(collection.id), collection)

    const { result } = renderHook(() => useDeleteCollectionMutation(), {
      wrapper: createWrapper(queryClient),
    })

    await result.current.mutateAsync(collection.id)

    expect(queryClient.getQueryData(COLLECTIONS_QUERY_KEYS.list())).toEqual([])
    expect(
      queryClient.getQueryData(COLLECTIONS_QUERY_KEYS.detail(collection.id))
    ).toBeUndefined()
  })
})
