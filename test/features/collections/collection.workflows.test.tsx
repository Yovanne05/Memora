import { act, renderHook } from "@testing-library/react"
import { vi } from "vitest"
import { useCollectionCreate } from "@/features/collections/hooks/useCollectionCreate"
import { useCollectionEdit } from "@/features/collections/hooks/useCollectionEdit"
import { useCollectionDelete } from "@/features/collections/hooks/useCollectionDelete"
import { useCollectionsFilters } from "@/features/collections/hooks/useCollectionsFilters"
import { useCollectionsBulkActions } from "@/features/collections/hooks/useCollectionsBulkActions"
import { useCollectionDetails } from "@/features/collections/hooks/useCollectionDetails"
import type { Collection } from "@/features/collections/models/collection.model"

interface MutationCallbacks<TData = unknown> {
  onSuccess?: (data: TData) => void
  onError?: (error: Error) => void
}

interface MockMutation {
  mutateAsync: ReturnType<typeof vi.fn>
  isPending: boolean
  error: Error | null
  reset: ReturnType<typeof vi.fn>
}

const mockUseCollectionsListQuery = vi.fn()

const createMutationFactory = () => {
  let callbacks: MutationCallbacks | undefined
  const mutateAsync = vi.fn(async (...args: unknown[]) => {
    callbacks?.onSuccess?.(args[0])
  })
  const reset = vi.fn()
  const hook = (cb?: MutationCallbacks): MockMutation => {
    callbacks = cb
    return { mutateAsync, isPending: false, error: null, reset }
  }
  return { hook, mutateAsync, reset }
}

const createMutation = createMutationFactory()
const updateMutation = createMutationFactory()
const deleteMutation = createMutationFactory()

const mockUseCollectionQuery = vi.fn()

vi.mock("@/features/collections/hooks/useCollectionsQuery", () => ({
  useCollectionsListQuery: () => mockUseCollectionsListQuery(),
  useCreateCollectionMutation: (cb?: MutationCallbacks) => createMutation.hook(cb),
  useUpdateCollectionMutation: (cb?: MutationCallbacks) => updateMutation.hook(cb),
  useDeleteCollectionMutation: (cb?: MutationCallbacks) => deleteMutation.hook(cb),
  useCollectionQuery: (id: string) => mockUseCollectionQuery(id),
}))

vi.mock("@/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({ userId: "user-1" }),
}))

const navigate = vi.fn()
vi.mock("@tanstack/react-router", () => ({
  useRouter: () => ({ navigate }),
  useParams: () => ({ id: "col-1" }),
}))

const sampleCollection: Collection = {
  id: "col-1",
  ownerId: "user-1",
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

describe("hooks collections (workflows)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createMutation.mutateAsync.mockClear()
    updateMutation.mutateAsync.mockClear()
    deleteMutation.mutateAsync.mockClear()
    mockUseCollectionsListQuery.mockReturnValue({
      data: [sampleCollection],
      isPending: false,
      error: null,
      refetch: vi.fn(),
    })
    mockUseCollectionQuery.mockReturnValue({
      data: sampleCollection,
      isPending: false,
      error: null,
      refetch: vi.fn(),
    })
  })

  test("useCollectionCreate ferme la modale apres creation", async () => {
    const { result } = renderHook(() => useCollectionCreate())

    expect(result.current.isOpen).toBe(false)
    act(() => result.current.open())
    expect(result.current.isOpen).toBe(true)

    await act(async () => {
      await result.current.submit({
        name: "Titre",
        description: "Desc",
        visibility: "public",
      })
    })

    expect(createMutation.mutateAsync).toHaveBeenCalledWith({
      ownerId: "user-1",
      name: "Titre",
      description: "Desc",
      visibility: "public",
    })
    expect(result.current.isOpen).toBe(false)
  })

  test("useCollectionEdit soumet les valeurs et reinitialise la cible", async () => {
    const { result } = renderHook(() => useCollectionEdit())

    act(() => result.current.open(sampleCollection))
    await act(async () => {
      await result.current.submit({
        name: "Maj",
        description: "Desc",
        visibility: "private",
      })
    })

    expect(updateMutation.mutateAsync).toHaveBeenCalledWith({
      id: "col-1",
      data: { name: "Maj", description: "Desc", visibility: "private" },
    })
    expect(result.current.target).toBeNull()
  })

  test("useCollectionDelete confirme et reinitialise", async () => {
    const { result } = renderHook(() => useCollectionDelete())
    act(() => result.current.open(sampleCollection))

    await act(async () => {
      await result.current.confirm()
    })

    expect(deleteMutation.mutateAsync).toHaveBeenCalledWith("col-1")
    expect(result.current.target).toBeNull()

    act(() => result.current.close())
    expect(deleteMutation.reset).toHaveBeenCalled()
  })

  test("useCollectionsBulkActions applique la visibilite et la suppression", async () => {
    const hook = renderHook(() =>
      useCollectionsBulkActions({
        selectedIds: ["col-1"],
        collections: [sampleCollection],
        onSuccess: vi.fn(),
      })
    )

    await act(async () => {
      await hook.result.current.setPublic()
    })
    expect(updateMutation.mutateAsync).toHaveBeenCalledWith({
      id: "col-1",
      data: { ...sampleCollection, visibility: "public" },
    })

    await act(async () => {
      await hook.result.current.deleteSelected()
    })
    expect(deleteMutation.mutateAsync).toHaveBeenCalledWith("col-1")
  })

  test("useCollectionsFilters retourne les collections filtrees", () => {
    const { result } = renderHook(() => useCollectionsFilters())

    expect(result.current.collections).toHaveLength(1)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  // Test removed: useCollectionsManager has been deleted in favor of individual hooks
  // Tests for individual hooks (useCollectionCreate, useCollectionEdit, useCollectionDelete) are covered separately

  test("useCollectionDetails expose les gestionnaires et valeurs initiales", async () => {
    const { result } = renderHook(() => useCollectionDetails("col-1"))

    expect(result.current.initialValues.name).toBe("Titre")

    await act(async () => {
      await result.current.handlers.onEdit({
        name: "Maj",
        description: "",
        visibility: "public",
      })
    })
    expect(updateMutation.mutateAsync).toHaveBeenCalledWith({
      id: "col-1",
      data: { name: "Maj", description: "", visibility: "public" },
    })

    act(() => result.current.handlers.onDelete())
    expect(result.current.deletion.target).toEqual(sampleCollection)

    await act(async () => {
      await result.current.deletion.confirmDelete()
    })
    expect(deleteMutation.mutateAsync).toHaveBeenCalledWith("col-1")
    expect(navigate).toHaveBeenCalledWith({ to: "/app/collections" })

    act(() => result.current.handlers.onBack())
    expect(navigate).toHaveBeenCalledWith({ to: "/app/collections" })
  })
})
