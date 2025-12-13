import { renderHook, waitFor, act } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { vi } from "vitest"
import { useCollectionDetails } from "@/features/collections/hooks/useCollectionDetails"
import type { Collection } from "@/features/collections/models/collection.model"
import React from "react"

const mockRouter = {
  navigate: vi.fn(),
}

vi.mock("@tanstack/react-router", () => ({
  useRouter: () => mockRouter,
}))

const mockCollectionsService = vi.hoisted(() => ({
  get: vi.fn(),
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

describe("useCollectionDetails", () => {
  let queryClient: QueryClient

  const collection: Collection = {
    id: "col-1",
    ownerId: "owner",
    name: "Test Collection",
    description: "Description",
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

  test("charge la collection et retourne les données", async () => {
    mockCollectionsService.get.mockResolvedValue(collection)

    const { result } = renderHook(() => useCollectionDetails("col-1"), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.collection).toEqual(collection)
    expect(result.current.error).toBeNull()
    expect(mockCollectionsService.get).toHaveBeenCalledWith("col-1")
  })

  test("initialValues contient les valeurs de la collection", async () => {
    mockCollectionsService.get.mockResolvedValue(collection)

    const { result } = renderHook(() => useCollectionDetails("col-1"), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => expect(result.current.collection).toEqual(collection))

    expect(result.current.initialValues).toEqual({
      name: "Test Collection",
      description: "Description",
      visibility: "private",
    })
  })

  test("handleEdit met à jour la collection", async () => {
    mockCollectionsService.get.mockResolvedValue(collection)
    const updated = { ...collection, name: "Updated" }
    mockCollectionsService.update.mockResolvedValue(updated)

    const { result } = renderHook(() => useCollectionDetails("col-1"), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => expect(result.current.collection).toEqual(collection))

    result.current.handlers.onEdit({
      name: "Updated",
      description: "Description",
      visibility: "private",
    })

    await waitFor(() => {
      expect(mockCollectionsService.update).toHaveBeenCalledWith("col-1", {
        name: "Updated",
        description: "Description",
        visibility: "private",
      })
    })
  })

  test("handleBack navigue vers la liste des collections", async () => {
    mockCollectionsService.get.mockResolvedValue(collection)

    const { result } = renderHook(() => useCollectionDetails("col-1"), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => expect(result.current.collection).toEqual(collection))

    result.current.handlers.onBack()

    expect(mockRouter.navigate).toHaveBeenCalledWith({ to: "/app/collections" })
  })

  test("handleDelete définit deleteTarget", async () => {
    mockCollectionsService.get.mockResolvedValue(collection)

    const { result } = renderHook(() => useCollectionDetails("col-1"), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => expect(result.current.collection).toEqual(collection))

    result.current.handlers.onDelete()

    await waitFor(() => {
      expect(result.current.deletion.target).toEqual(collection)
    })
  })

  test("confirmDelete supprime la collection et navigue", async () => {
    mockCollectionsService.get.mockResolvedValue(collection)
    mockCollectionsService.remove.mockResolvedValue(undefined)

    const { result } = renderHook(() => useCollectionDetails("col-1"), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => expect(result.current.collection).toEqual(collection))

    result.current.handlers.onDelete()

    await waitFor(() => {
      expect(result.current.deletion.target).toEqual(collection)
    })

    result.current.deletion.confirmDelete()

    await waitFor(() => {
      expect(mockCollectionsService.remove).toHaveBeenCalledWith("col-1")
    })

    await waitFor(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith({ to: "/app/collections" })
    })
  })

  test("isEditing peut être basculé", async () => {
    mockCollectionsService.get.mockResolvedValue(collection)

    const { result } = renderHook(() => useCollectionDetails("col-1"), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => expect(result.current.collection).toEqual(collection))

    expect(result.current.isEditing).toBe(false)

    result.current.setIsEditing(true)

    await waitFor(() => {
      expect(result.current.isEditing).toBe(true)
    })
  })
})
