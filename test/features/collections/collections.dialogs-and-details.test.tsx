import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { vi } from "vitest"
import { CollectionFormDialog } from "@/features/collections/components/dialogs/CollectionFormDialog"
import { DeleteCollectionDialog } from "@/features/collections/components/dialogs/DeleteCollectionDialog"
import { CollectionDialogs } from "@/features/collections/components/dialogs/CollectionDialogs"
import { CollectionActions } from "@/features/collections/components/details/CollectionActions"
import { CollectionDetailsError } from "@/features/collections/components/details/CollectionDetailsError"
import { CollectionDetailsSkeleton } from "@/features/collections/components/details/CollectionDetailsSkeleton"
import type { Collection } from "@/features/collections/models/collection.model"

const navigate = vi.fn()
vi.mock("@tanstack/react-router", () => ({
  useRouter: () => ({ navigate }),
}))

const collection: Collection = {
  id: "col-1",
  ownerId: "owner",
  name: "Titre",
  description: "Desc",
  visibility: "private",
  notes: [],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-02T00:00:00.000Z",
}

describe("Dialogues et sections details", () => {
  test("CollectionFormDialog affiche les valeurs initiales et declenche onSubmit", async () => {
    const onSubmit = vi.fn()
    render(
      <CollectionFormDialog
        mode="edit"
        open
        isPending={false}
        initial={{ name: "Titre", description: "Desc", visibility: "public" }}
        onSubmit={onSubmit}
        onClose={vi.fn()}
      />
    )

    await userEvent.click(screen.getByRole("button", { name: /Enregistrer/ }))
    expect(onSubmit).toHaveBeenCalled()
  })

  test("DeleteCollectionDialog appelle les callbacks", async () => {
    const onCancel = vi.fn()
    const onConfirm = vi.fn()
    render(
      <DeleteCollectionDialog
        open
        collection={collection}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    )

    await userEvent.click(screen.getByRole("button", { name: /Annuler/ }))
    expect(onCancel).toHaveBeenCalled()

    await userEvent.click(screen.getByRole("button", { name: /Supprimer/ }))
    expect(onConfirm).toHaveBeenCalled()
  })

  test("CollectionDialogs relaie les props vers les sous-dialogues", () => {
    render(
      <CollectionDialogs
        createOpen
        creating={false}
        onCreateSubmit={vi.fn()}
        onCreateClose={vi.fn()}
        editing={collection}
        updating={false}
        onEditSubmit={vi.fn()}
        onEditClose={vi.fn()}
        deletion={{
          target: collection,
          loading: false,
          error: null,
          reset: vi.fn(),
          confirmDelete: vi.fn(),
        }}
      />
    )

    expect(screen.getAllByText("Titre").length).toBeGreaterThan(0)
  })

  test("CollectionActions appelle les gestionnaires", async () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    render(<CollectionActions onEdit={onEdit} onDelete={onDelete} isDeleting={false} />)

    await userEvent.click(screen.getByRole("button", { name: /Modifier/ }))
    await userEvent.click(screen.getByRole("button", { name: /Supprimer/ }))
    expect(onEdit).toHaveBeenCalled()
    expect(onDelete).toHaveBeenCalled()
  })

  test("CollectionDetailsError propose retry et navigation", async () => {
    const onRetry = vi.fn()
    render(<CollectionDetailsError error="Erreur" onRetry={onRetry} />)

    await userEvent.click(screen.getByText(/Erreur/))
    await userEvent.click(screen.getByRole("button", { name: /essayer/i }))
    expect(onRetry).toHaveBeenCalled()

    await userEvent.click(screen.getByRole("button", { name: /Retour aux collections/ }))
    expect(navigate).toHaveBeenCalledWith({ to: "/app/collections" })
  })

  test("CollectionDetailsSkeleton rend le squelette", () => {
    const { container } = render(<CollectionDetailsSkeleton />)
    expect(container.firstChild).not.toBeNull()
  })
})
