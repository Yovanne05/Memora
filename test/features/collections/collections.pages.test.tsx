import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { vi } from "vitest"
import { CollectionsListPage } from "@/features/collections/pages/CollectionsListPage"
import { CollectionsDetailsPage } from "@/features/collections/pages/CollectionsDetailsPage"
import type { Collection } from "@/features/collections/models/collection.model"

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

vi.mock("@/features/collections/hooks/useCollectionsFilters", () => ({
  useCollectionsFilters: () => ({
    search: "",
    setSearch: vi.fn(),
    tab: "mine",
    setTab: vi.fn(),
    sort: "recent",
    setSort: vi.fn(),
    visibilityFilter: undefined,
    setVisibilityFilter: vi.fn(),
    showFilters: false,
    setShowFilters: vi.fn(),
    collections: [sampleCollection],
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
}))

vi.mock("@/features/collections/hooks/useCollectionCreate", () => ({
  useCollectionCreate: () => ({
    isOpen: false,
    open: vi.fn(),
    close: vi.fn(),
    submit: vi.fn(),
    loading: false,
    error: null,
  }),
}))

vi.mock("@/features/collections/hooks/useCollectionEdit", () => ({
  useCollectionEdit: () => ({
    target: null,
    open: vi.fn(),
    close: vi.fn(),
    submit: vi.fn(),
    loading: false,
    error: null,
  }),
}))

vi.mock("@/features/collections/hooks/useCollectionDelete", () => ({
  useCollectionDelete: () => ({
    target: null,
    open: vi.fn(),
    close: vi.fn(),
    confirm: vi.fn(),
    loading: false,
    error: null,
  }),
}))

vi.mock("@/features/collections/hooks/useCollectionsSelection", () => ({
  useCollectionsSelection: () => ({
    selectedIds: [],
    selectedCount: 0,
    selectionMode: false,
    toggleSelection: vi.fn(),
    selectAll: vi.fn(),
    clearSelection: vi.fn(),
    isSelected: vi.fn(),
    toggleSelectionMode: vi.fn(),
    exitSelectionMode: vi.fn(),
  }),
}))

vi.mock("@/features/collections/hooks/useCollectionsBulkActions", () => ({
  useCollectionsBulkActions: () => ({
    setPrivate: vi.fn(),
    setPublic: vi.fn(),
    deleteSelected: vi.fn(),
    isLoading: false,
  }),
}))

vi.mock("@/features/collections/hooks/useCollectionsKeyboardShortcuts", () => ({
  useCollectionsKeyboardShortcuts: () => {},
}))

const mockDetails = vi.fn()
vi.mock("@/features/collections/hooks/useCollectionDetails", () => ({
  useCollectionDetails: (...args: unknown[]) => mockDetails(...args),
}))

vi.mock("@tanstack/react-router", () => ({
  useParams: () => ({ id: "col-1" }),
  useRouter: () => ({ navigate: vi.fn() }),
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}))

vi.mock("@/features/notes/hooks/useNotesQuery", () => ({
  useNotesQuery: () => ({ data: { items: [] }, isLoading: false }),
}))

vi.mock("@/features/notes/hooks/useUpdateNoteMutation", () => ({
  useUpdateNoteMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

describe("Pages des collections", () => {
  test("CollectionsListPage affiche les cartes depuis les filtres", () => {
    render(<CollectionsListPage />)
    expect(screen.getByText("Titre")).toBeInTheDocument()
  })

  test("CollectionsDetailsPage affiche les etats de chargement et d'erreur", () => {
    mockDetails.mockReturnValue({
      collection: null,
      loading: true,
      error: null,
      reload: vi.fn(),
    })
    const { rerender } = render(<CollectionsDetailsPage />)
    expect(mockDetails).toHaveBeenCalledWith("col-1")

    mockDetails.mockReturnValue({
      collection: null,
      loading: false,
      error: "Erreur",
      reload: vi.fn(),
    })
    rerender(<CollectionsDetailsPage />)
    expect(screen.getByText(/Erreur/)).toBeInTheDocument()
  })

  test("CollectionsDetailsPage rend les informations quand la collection existe", async () => {
    mockDetails.mockReturnValue({
      collection: sampleCollection,
      loading: false,
      error: null,
      reload: vi.fn(),
      isEditing: false,
      setIsEditing: vi.fn(),
      updateHook: { loading: false },
      deletion: {
        target: null,
        loading: false,
        error: null,
        reset: vi.fn(),
        confirmDelete: vi.fn(),
      },
      initialValues: {
        name: sampleCollection.name,
        description: sampleCollection.description,
        visibility: sampleCollection.visibility,
      },
      handlers: {
        onEdit: vi.fn(),
        onBack: vi.fn(),
        onDelete: vi.fn(),
      },
    })

    render(<CollectionsDetailsPage />)
    expect(screen.getByText(sampleCollection.name)).toBeInTheDocument()
    await userEvent.click(screen.getByLabelText(/Retour aux collections/))
  })
})
