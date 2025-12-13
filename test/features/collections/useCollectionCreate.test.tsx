import { renderHook, waitFor, act } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { vi } from "vitest"
import { useCollectionCreate } from "@/features/collections/hooks/useCollectionCreate"
import type { Collection } from "@/features/collections/models/collection.model"
import React from "react"

const mockUserId = "user-123"

vi.mock("@/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({ userId: mockUserId }),
}))

const mockCollectionsService = vi.hoisted(() => ({
  create: vi.fn(),
}))

vi.mock("@/features/collections/services/collections.service", () => ({
  collectionsService: mockCollectionsService,
}))

const createWrapper = (client: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
}

describe("useCollectionCreate", () => {
  let queryClient: QueryClient

  const newCollection: Collection = {
    id: "col-new",
    ownerId: mockUserId,
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

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
  })

  test("l'état initial est fermé", () => {
    const { result } = renderHook(() => useCollectionCreate(), {
      wrapper: createWrapper(queryClient),
    })

    expect(result.current.isOpen).toBe(false)
    expect(result.current.loading).toBe(false)
  })

  test("open et close basculent isOpen", () => {
    const { result } = renderHook(() => useCollectionCreate(), {
      wrapper: createWrapper(queryClient),
    })

    act(() => {
      result.current.open()
    })

    expect(result.current.isOpen).toBe(true)

    act(() => {
      result.current.close()
    })

    expect(result.current.isOpen).toBe(false)
  })

  test("submit crée une collection avec userId", async () => {
    mockCollectionsService.create.mockResolvedValue(newCollection)

    const { result } = renderHook(() => useCollectionCreate(), {
      wrapper: createWrapper(queryClient),
    })

    act(() => {
      result.current.open()
    })

    expect(result.current.isOpen).toBe(true)

    await act(async () => {
      await result.current.submit({
        name: "New Collection",
        description: "New Description",
        visibility: "private",
      })
    })

    expect(mockCollectionsService.create).toHaveBeenCalledWith({
      ownerId: mockUserId,
      name: "New Collection",
      description: "New Description",
      visibility: "private",
    })

    await waitFor(() => {
      expect(result.current.isOpen).toBe(false)
    })
  })

  test("loading est vrai pendant la création", async () => {
    let resolveCreate: (value: Collection) => void
    mockCollectionsService.create.mockImplementation(
      () => new Promise((resolve) => { resolveCreate = resolve })
    )

    const { result } = renderHook(() => useCollectionCreate(), {
      wrapper: createWrapper(queryClient),
    })

    await act(async () => {
      const promise = result.current.submit({
        name: "New Collection",
        description: "New Description",
        visibility: "private",
      })
      await waitFor(() => {
        expect(result.current.loading).toBe(true)
      })
      resolveCreate(newCollection)
      await promise
    })

    expect(result.current.loading).toBe(false)
  })

  test("error est défini en cas d'échec", async () => {
    const error = new Error("Creation failed")
    mockCollectionsService.create.mockRejectedValue(error)

    const { result } = renderHook(() => useCollectionCreate(), {
      wrapper: createWrapper(queryClient),
    })

    await act(async () => {
      try {
        await result.current.submit({
          name: "New Collection",
          description: "New Description",
          visibility: "private",
        })
      } catch (e) {
        // Expected error
      }
    })

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })
  })
})
