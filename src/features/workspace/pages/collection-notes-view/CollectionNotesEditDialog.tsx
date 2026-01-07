import { CollectionFormDialog } from "@/features/collections/components/CollectionFormDialog"
import type { Collection } from "@/features/collections/models/collection.model"
import type { CollectionFormValues } from "@/features/collections/components/CollectionEditForm"

type CollectionNotesEditDialogProps = {
  collection: Collection | null
  open: boolean
  isPending: boolean
  onClose: () => void
  onSubmit: (values: CollectionFormValues) => Promise<void> | void
}

export function CollectionNotesEditDialog({
  collection,
  open,
  isPending,
  onClose,
  onSubmit,
}: Readonly<CollectionNotesEditDialogProps>) {
  if (!collection) {
    return null
  }

  return (
    <CollectionFormDialog
      mode="edit"
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      isPending={isPending}
      initial={{
        name: collection.name,
        description: collection.description ?? undefined,
        visibility: collection.visibility,
        tags: collection.tags,
      }}
    />
  )
}
