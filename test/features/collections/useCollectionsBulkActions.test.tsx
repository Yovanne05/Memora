import { renderHook, act } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { vi } from "vitest"
import { useCollectionsBulkActions } from "@/features/collections/hooks/useCollectionsBulkActions"
import type { Collection } from "@/features/collections/models/collection.model"
import React from "react"

const mockCollectionsService = vi.hoisted(() => ({
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

describe("useCollectionsBulkActions", () => {
  let queryClient: QueryClient

  const collections: Collection[] = [
    {
      id: "col-1",
      ownerId: "owner",
      name: "Collection 1",
      description: "Desc 1",
      visibility: "private",
      tags: [],
      notes: [],
      nodes: [],
      edges: [],
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-02T00:00:00.000Z",
    },
    {
      id: "col-2",
      ownerId: "owner",
      name: "Collection 2",
      description: "Desc 2",
      visibility: "public",
      tags: [],
      notes: [],
      nodes: [],
      edges: [],
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-02T00:00:00.000Z",
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
  })

  test("setPrivate met toutes les collections sélectionnées en private", async () => {
    mockCollectionsService.update.mockResolvedValue({})
    const onSuccess = vi.fn()

    const { result } = renderHook(
      () =>
        useCollectionsBulkActions({
          selectedIds: ["col-1", "col-2"],
          collections,
          onSuccess,
        }),
      { wrapper: createWrapper(queryClient) }
    )

    await act(async () => {
      await result.current.setPrivate()
    })

    expect(mockCollectionsService.update).toHaveBeenCalledTimes(2)
    expect(mockCollectionsService.update).toHaveBeenCalledWith("col-1", {
      ...collections[0],
      visibility: "private",
    })
    expect(mockCollectionsService.update).toHaveBeenCalledWith("col-2", {
      ...collections[1],
      visibility: "private",
    })
    expect(onSuccess).toHaveBeenCalled()
  })

  test("setPublic met toutes les collections sélectionnées en public", async () => {
    mockCollectionsService.update.mockResolvedValue({})
    const onSuccess = vi.fn()

    const { result } = renderHook(
      () =>
        useCollectionsBulkActions({
          selectedIds: ["col-1"],
          collections,
          onSuccess,
        }),
      { wrapper: createWrapper(queryClient) }
    )

    await act(async () => {
      await result.current.setPublic()
    })

    expect(mockCollectionsService.update).toHaveBeenCalledTimes(1)
    expect(mockCollectionsService.update).toHaveBeenCalledWith("col-1", {
      ...collections[0],
      visibility: "public",
    })
    expect(onSuccess).toHaveBeenCalled()
  })

  test("deleteSelected supprime toutes les collections sélectionnées", async () => {
    mockCollectionsService.remove.mockResolvedValue(undefined)
    const onSuccess = vi.fn()

    const { result } = renderHook(
      () =>
        useCollectionsBulkActions({
          selectedIds: ["col-1", "col-2"],
          collections,
          onSuccess,
        }),
      { wrapper: createWrapper(queryClient) }
    )

    await act(async () => {
      await result.current.deleteSelected()
    })

    expect(mockCollectionsService.remove).toHaveBeenCalledTimes(2)
    expect(mockCollectionsService.remove).toHaveBeenCalledWith("col-1")
    expect(mockCollectionsService.remove).toHaveBeenCalledWith("col-2")
    expect(onSuccess).toHaveBeenCalled()
  })
/** 
  test("isLoading est vrai pendant les opérations", async () => {
    let resolveUpdate: (value: unknown) => void
    mockCollectionsService.update.mockImplementation(
      () => new Promise((resolve) => { resolveUpdate = resolve })
    )

    const { result } = renderHook(
      () =>
        useCollectionsBulkActions({
          selectedIds: ["col-1"],
          collections,
        }),
      { wrapper: createWrapper(queryClient) }
    )

    expect(result.current.isLoading).toBe(false)

    let promise: Promise<void>
    act(() => {
      promise = result.current.setPrivate()
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true)
    })

    await act(async () => {
      resolveUpdate({})
      await promise
    })

    expect(result.current.isLoading).toBe(false)
  })
*/
  test("ne traite pas les IDs invalides", async () => {
    mockCollectionsService.update.mockResolvedValue({})
    const onSuccess = vi.fn()

    const { result } = renderHook(
      () =>
        useCollectionsBulkActions({
          selectedIds: ["col-invalid"],
          collections,
          onSuccess,
        }),
      { wrapper: createWrapper(queryClient) }
    )

    await act(async () => {
      await result.current.setPrivate()
    })

    expect(mockCollectionsService.update).not.toHaveBeenCalled()
    expect(onSuccess).toHaveBeenCalled()
  })
})
