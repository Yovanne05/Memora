import { DeleteCollectionDialog } from "./DeleteCollectionDialog"
import type { Collection } from "../models/collection.model"
import type { CollectionFormValues } from "./CollectionEditForm"
import { CollectionFormDialog } from "./CollectionFormDialog"

interface CollectionDialogsProps {
  createOpen: boolean
  creating: boolean
  onCreateSubmit: (values: CollectionFormValues) => Promise<void>
  onCreateClose: () => void

  editing: Collection | null
  updating: boolean
  onEditSubmit: (values: CollectionFormValues) => Promise<void>
  onEditClose: () => void

  deletion: {
    target: Collection | null
    loading: boolean
    error: string | null
    reset: () => void
    confirmDelete: () => Promise<void>
  }
}

export function CollectionDialogs({
  createOpen,
  creating,
  onCreateSubmit,
  onCreateClose,
  editing,
  updating,
  onEditSubmit,
  onEditClose,
  deletion,
}: CollectionDialogsProps) {
  return (
    <>
      <CollectionFormDialog
        mode="create"
        open={createOpen}
        isPending={creating}
        onSubmit={onCreateSubmit}
        onClose={onCreateClose}
      />

      {editing && (
        <CollectionFormDialog
          mode="edit"
          open={!!editing}
          isPending={updating}
          initial={{
            name: editing.name,
            description: editing.description ?? "",
            visibility: editing.visibility,
            tags: editing.tags ?? [],
          }}
          onSubmit={onEditSubmit}
          onClose={onEditClose}
        />
      )}

      <DeleteCollectionDialog
        open={!!deletion.target}
        collection={deletion.target}
        loading={deletion.loading}
        error={deletion.error ?? undefined}
        onCancel={deletion.reset}
        onConfirm={deletion.confirmDelete}
      />
    </>
  )
}
