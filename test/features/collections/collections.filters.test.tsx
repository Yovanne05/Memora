import { renderHook } from "@testing-library/react"
import { vi } from "vitest"
import { useCollectionsFilters } from "@/features/collections/hooks/useCollectionsFilters"
import type { Collection } from "@/features/collections/models/collection.model"

const applyCollectionsQueryMock = vi.hoisted(() => vi.fn())
const useCollectionsListQueryMock = vi.hoisted(() => vi.fn())
const useCurrentUserMock = vi.hoisted(() => vi.fn())

vi.mock("@/features/collections/lib/collections-query", () => ({
  applyCollectionsQuery: applyCollectionsQueryMock,
}))

vi.mock("@/features/collections/hooks/useCollectionsQuery", () => ({
  useCollectionsListQuery: () => useCollectionsListQueryMock(),
}))

vi.mock("@/hooks/useCurrentUser", () => ({
  useCurrentUser: () => useCurrentUserMock(),
}))

const collection: Collection = {
  id: "col-1",
  ownerId: "user-1",
  name: "Titre",
  description: "Desc",
  visibility: "private",
  notes: [],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-02T00:00:00.000Z",
}

describe("useCollectionsFilters", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCollectionsListQueryMock.mockReturnValue({
      data: [collection],
      isPending: false,
      error: null,
      refetch: vi.fn(),
    })
    useCurrentUserMock.mockReturnValue({ userId: "user-1" })
    applyCollectionsQueryMock.mockReturnValue([collection])
  })

  test("applique le filtre et renvoie les collections filtrées", () => {
    const { result } = renderHook(() => useCollectionsFilters())

    expect(result.current.collections).toEqual([collection])
    expect(applyCollectionsQueryMock).toHaveBeenCalledWith([collection], {
      currentUserId: "user-1",
      tab: "mine",
      search: "",
      sort: "recent",
      visibilityFilter: undefined,
    })
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  test("renvoie un tableau vide si aucun utilisateur courant", () => {
    useCurrentUserMock.mockReturnValueOnce({ userId: undefined })

    const { result } = renderHook(() => useCollectionsFilters())

    expect(result.current.collections).toEqual([])
    expect(applyCollectionsQueryMock).not.toHaveBeenCalled()
  })
})
