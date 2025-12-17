import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { vi } from "vitest"
import { CollectionCard } from "@/features/collections/components/list/CollectionCard"
import { CollectionsContent } from "@/features/collections/components/list/CollectionsContent"
import { CollectionsBulkActions } from "@/features/collections/components/list/CollectionsBulkActions"
import { CollectionsToolbar } from "@/features/collections/components/list/CollectionsToolbar"
import { CollectionsPageActions } from "@/features/collections/components/list/CollectionsPageActions"
import { CollectionsKeyboardHelp } from "@/features/collections/components/list/CollectionsKeyboardHelp"
import { CollectionsHeader } from "@/features/collections/components/list/CollectionsHeader"
import type { Collection } from "@/features/collections/models/collection.model"

const navigate = vi.fn()
vi.mock("@tanstack/react-router", () => ({
  useRouter: () => ({ navigate }),
}))

const collection: Collection = {
  id: "col-1",
  ownerId: "owner",
  name: "Titre",
  description: "Description",
  visibility: "private",
  notes: [],
  tags: [],
  nodes: [],
  edges: [],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-02T00:00:00.000Z",
}

describe("Composants liste des collections", () => {
  test("CollectionCard navigue ou toggle selon le mode", async () => {
    const firstRender = render(
      <CollectionCard
        collection={collection}
        onCardClick={(c) => navigate({ to: "/app/collections/" + c.id })}
      />
    )

    await userEvent.click(screen.getByText("Titre"))
    expect(navigate).toHaveBeenCalledWith({ to: "/app/collections/col-1" })

    firstRender.unmount()

    const toggle = vi.fn()
    render(
      <CollectionCard
        collection={collection}
        selectionMode
        isSelected={false}
        onToggleSelection={toggle}
      />
    )
    await userEvent.click(screen.getByText("Titre"))
    expect(toggle).toHaveBeenCalledWith("col-1")
  })

  test("CollectionsContent gere erreur, vide et rendu des cartes", async () => {
    const retry = vi.fn()
    const { rerender } = render(
      <CollectionsContent
        loading={false}
        error="Oups"
        collections={[]}
        onRetry={retry}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    await userEvent.click(screen.getByRole("button", { name: /essayer/i }))
    expect(retry).toHaveBeenCalled()

    rerender(
      <CollectionsContent
        loading={false}
        error={null}
        collections={[]}
        onRetry={retry}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    expect(screen.getByText(/Aucune collection/)).toBeInTheDocument()

    rerender(
      <CollectionsContent
        loading={false}
        error={null}
        collections={[collection]}
        onRetry={retry}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    expect(screen.getByText("Titre")).toBeInTheDocument()
  })

  test("CollectionsBulkActions rend les boutons uniquement si selection", async () => {
    const { rerender } = render(
      <CollectionsBulkActions
        selectedCount={0}
        onClearSelection={vi.fn()}
        onBulkDelete={vi.fn()}
        onBulkSetPrivate={vi.fn()}
        onBulkSetPublic={vi.fn()}
      />
    )
    expect(screen.queryByText(/selectionnee/i)).toBeNull()

    const bulkDelete = vi.fn()
    rerender(
      <CollectionsBulkActions
        selectedCount={2}
        onClearSelection={vi.fn()}
        onBulkDelete={bulkDelete}
        onBulkSetPrivate={vi.fn()}
        onBulkSetPublic={vi.fn()}
      />
    )
    await userEvent.click(screen.getByText(/Supprimer/))
    expect(bulkDelete).toHaveBeenCalled()
  })

  test("CollectionsToolbar met a jour la recherche et les filtres", async () => {
    const onSearchChange = vi.fn()
    const onVisibilityFilterChange = vi.fn()
    const toggleFilters = vi.fn()
    render(
      <CollectionsToolbar
        search=""
        onSearchChange={onSearchChange}
        tab="mine"
        onTabChange={vi.fn()}
        sort="recent"
        onSortChange={vi.fn()}
        visibilityFilter={undefined}
        onVisibilityFilterChange={onVisibilityFilterChange}
        showFilters={false}
        onToggleFilters={toggleFilters}
      />
    )

    await userEvent.type(screen.getByPlaceholderText(/Rechercher des collections/), "abc")
    expect(onSearchChange).toHaveBeenCalled()

    await userEvent.click(screen.getByText(/Filtres/))
    expect(toggleFilters).toHaveBeenCalled()
  })

  test("CollectionsPageActions active le mode selection et desactive la creation", async () => {
    const toggle = vi.fn()
    const onCreate = vi.fn()
    const { rerender } = render(
      <CollectionsPageActions
        selectionMode={false}
        onToggleSelectionMode={toggle}
        onCreateClick={onCreate}
      />
    )

    await userEvent.click(screen.getByLabelText(/Mode s.+lection/i))
    expect(toggle).toHaveBeenCalled()

    rerender(
      <CollectionsPageActions
        selectionMode
        onToggleSelectionMode={toggle}
        onCreateClick={onCreate}
      />
    )
    expect(screen.getByLabelText(/nouvelle collection/i)).toBeDisabled()
  })

  test("CollectionsKeyboardHelp affiche les raccourcis", async () => {
    render(<CollectionsKeyboardHelp />)
    await userEvent.click(screen.getByLabelText(/Raccourcis clavier/))
    expect(await screen.findByText(/Nouvelle collection/i)).toBeInTheDocument()
  })

  test("CollectionsHeader affiche le titre", () => {
    render(<CollectionsHeader />)
    expect(screen.getByText("Collections")).toBeInTheDocument()
  })
})
