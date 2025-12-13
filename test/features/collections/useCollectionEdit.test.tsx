import { renderHook, waitFor, act } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { vi } from "vitest"
import { useCollectionEdit } from "@/features/collections/hooks/useCollectionEdit"
import type { Collection } from "@/features/collections/models/collection.model"
import React from "react"

const mockCollectionsService = vi.hoisted(() => ({
  update: vi.fn(),
}))

vi.mock("@/features/collections/services/collections.service", () => ({
  collectionsService: mockCollectionsService,
}))

const createWrapper = (client: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
}

describe("useCollectionEdit", () => {
  let queryClient: QueryClient

  const collection: Collection = {
    id: "col-1",
    ownerId: "owner",
    name: "Original",
    description: "Original Desc",
    visibility: "private",
    tags: [],
    notes: [],
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

  test("l'état initial est vide", () => {
    const { result } = renderHook(() => useCollectionEdit(), {
      wrapper: createWrapper(queryClient),
    })

    expect(result.current.target).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  test("open définit la collection cible", () => {
    const { result } = renderHook(() => useCollectionEdit(), {
      wrapper: createWrapper(queryClient),
    })

    act(() => {
      result.current.open(collection)
    })

    expect(result.current.target).toEqual(collection)
  })

  test("submit met à jour la collection", async () => {
    const updated = { ...collection, name: "Updated" }
    mockCollectionsService.update.mockResolvedValue(updated)

    const { result } = renderHook(() => useCollectionEdit(), {
      wrapper: createWrapper(queryClient),
    })

    act(() => {
      result.current.open(collection)
    })

    await act(async () => {
      await result.current.submit({
        name: "Updated",
        description: "Original Desc",
        visibility: "private",
      })
    })

    expect(mockCollectionsService.update).toHaveBeenCalledWith("col-1", {
      name: "Updated",
      description: "Original Desc",
      visibility: "private",
    })

    await waitFor(() => {
      expect(result.current.target).toBeNull()
    })
  })

  test("close réinitialise target", () => {
    const { result } = renderHook(() => useCollectionEdit(), {
      wrapper: createWrapper(queryClient),
    })

    act(() => {
      result.current.open(collection)
    })

    expect(result.current.target).toEqual(collection)

    act(() => {
      result.current.close()
    })

    expect(result.current.target).toBeNull()
  })

  test("loading est vrai pendant la mise à jour", async () => {
    mockCollectionsService.update.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({}), 100))
    )

    const { result } = renderHook(() => useCollectionEdit(), {
      wrapper: createWrapper(queryClient),
    })

    act(() => {
      result.current.open(collection)
    })

    act(() => {
      result.current.submit({
        name: "Updated",
        description: "Desc",
        visibility: "private",
      })
    })

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })
})
