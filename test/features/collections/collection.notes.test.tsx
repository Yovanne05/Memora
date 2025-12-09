import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { vi } from "vitest"
import { CollectionNotesHeader } from "@/features/collections/components/details/CollectionNotesHeader"
import { CollectionNotesGrid } from "@/features/collections/components/details/CollectionNotesGrid"
import { CollectionNotesSection } from "@/features/collections/components/details/CollectionNotesSection"
import type { Note } from "@/features/notes/models/note.model"

const mockUseNotesQuery = vi.fn()
const mockUpdateNoteMutation = { mutateAsync: vi.fn(), isPending: false }

vi.mock("@/features/notes/hooks/useNotesQuery", () => ({
  useNotesQuery: (...args: unknown[]) => mockUseNotesQuery(...args),
}))

vi.mock("@/features/notes/hooks/useUpdateNoteMutation", () => ({
  useUpdateNoteMutation: () => mockUpdateNoteMutation,
}))

vi.mock("@/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({ userId: "user-1" }),
}))

vi.mock("@tanstack/react-router", () => ({
  useParams: () => ({ id: "col-1" }),
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}))

vi.mock("@/components/ui/form-select", () => ({
  FormSelect: ({ value, onValueChange, options, id }: any) => (
    <select
      data-testid={id ?? "form-select"}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
    >
      <option value="">--</option>
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
}))

const note: Note = {
  id: "n1",
  collectionId: "col-1",
  ownerId: "user-1",
  title: "Note 1",
  content: "Contenu",
  visibility: "private",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-02T00:00:00.000Z",
}

describe("Notes des collections", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseNotesQuery.mockReset()
    mockUpdateNoteMutation.mutateAsync.mockReset()
  })

  test("CollectionNotesHeader desactive la recherche si aucune note dispo", () => {
    render(
      <CollectionNotesHeader
        availableNotes={[]}
        selected=""
        isAdding={false}
        onSelectNote={vi.fn()}
        searchValue=""
        onSearchChange={vi.fn()}
        sortValue="recent"
        onSortChange={vi.fn()}
      />
    )

    expect(screen.getByLabelText(/Rechercher/)).toBeDisabled()
  })

  test("CollectionNotesGrid appelle le callback de suppression", async () => {
    const onRemove = vi.fn()
    render(
      <CollectionNotesGrid
        notes={[note]}
        isLoading={false}
        isUpdating={false}
        onRemoveFromCollection={onRemove}
      />
    )

    await userEvent.click(screen.getByRole("button", { name: /Retirer/ }))
    expect(onRemove).toHaveBeenCalledWith("n1")
  })

  test("CollectionNotesSection ajoute et retire des notes", async () => {
    mockUseNotesQuery.mockImplementation((page: number, limit: number, filters: any) => {
      if (filters.collectionId) {
        return { data: { items: [note], total: 1 }, isLoading: false }
      }
      return {
        data: {
          items: [
            note,
            {
              ...note,
              id: "available-1",
              collectionId: null,
              title: "Autre",
            },
          ],
          total: 2,
        },
        isLoading: false,
      }
    })

    render(<CollectionNotesSection />)

    await userEvent.selectOptions(screen.getByTestId("add-note"), "available-1")
    expect(mockUpdateNoteMutation.mutateAsync).toHaveBeenCalledWith({
      noteId: "available-1",
      payload: { collection_id: "col-1" },
    })

    await userEvent.click(screen.getByRole("button", { name: /Retirer/ }))
    expect(mockUpdateNoteMutation.mutateAsync).toHaveBeenCalledWith({
      noteId: "n1",
      payload: { collection_id: null },
    })
  })
})
