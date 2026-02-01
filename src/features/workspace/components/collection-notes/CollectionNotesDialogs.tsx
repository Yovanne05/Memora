import type { Collection } from '@/features/collections/models/collection.model'
import type { CollectionFormValues } from '@/features/collections/types/collection-form.types'
import { CollectionNotesEditDialog } from './CollectionNotesEditDialog'
import { CollectionShareDialog } from '@/features/collections/components/CollectionShareDialog'
import { CollectionDeleteDialog } from '../favorites/CollectionDeleteDialog'

type CollectionNotesDialogsProps = {
  collection: Collection | null
  canManage: boolean
  editDialogOpen: boolean
  shareDialogOpen: boolean
  deleteDialogOpen: boolean
  updatePending: boolean
  deletePending: boolean
  onEditClose: () => void
  onEditSubmit: (values: CollectionFormValues) => Promise<void>
  onShareOpenChange: (open: boolean) => void
  onDeleteOpenChange: (open: boolean) => void
  onDeleteConfirm: () => void
}

export function CollectionNotesDialogs({
  collection,
  canManage,
  editDialogOpen,
  shareDialogOpen,
  deleteDialogOpen,
  updatePending,
  deletePending,
  onEditClose,
  onEditSubmit,
  onShareOpenChange,
  onDeleteOpenChange,
  onDeleteConfirm,
}: Readonly<CollectionNotesDialogsProps>) {
  return (
    <>
      <CollectionNotesEditDialog
        collection={collection}
        open={editDialogOpen}
        onClose={onEditClose}
        onSubmit={onEditSubmit}
        isPending={updatePending}
      />

      {collection && canManage && (
        <CollectionShareDialog
          collectionId={collection.id}
          collectionName={collection.name}
          open={shareDialogOpen}
          onOpenChange={onShareOpenChange}
        />
      )}

      <CollectionDeleteDialog
        collectionName={collection?.name}
        isPending={deletePending}
        open={deleteDialogOpen}
        onOpenChange={onDeleteOpenChange}
        onConfirm={onDeleteConfirm}
      />
    </>
  )
}
