import { useState } from 'react'
import type { Collection } from '@/features/collections/models/collection.model'
import type { CollectionFormValues } from '@/features/collections/types/collection-form.types'
import { CollectionCard } from '@/features/collections/components/CollectionCard'
import { CollectionFormDialog } from '@/features/collections/components/CollectionFormDialog'
import { CollectionShareDialog } from '@/features/collections/components/CollectionShareDialog'
import { CollectionDeleteDialog } from '@/features/workspace/components/favorites/CollectionDeleteDialog'
import { useUpdateCollectionMutation } from '@/features/collections/hooks/useUpdateCollectionMutation'
import { useDeleteCollectionMutation } from '@/features/collections/hooks/useDeleteCollectionMutation'

type CollectionsWithActionsProps = {
  collections: Collection[]
}

export function CollectionsWithActions({
  collections,
}: Readonly<CollectionsWithActionsProps>) {
  const [editingCollection, setEditingCollection] = useState<Collection | null>(
    null
  )
  const [sharingCollection, setSharingCollection] = useState<Collection | null>(
    null
  )
  const [deletingCollection, setDeletingCollection] =
    useState<Collection | null>(null)

  const updateMutation = useUpdateCollectionMutation()
  const deleteMutation = useDeleteCollectionMutation()

  const handleEdit = (collection: Collection) => {
    setEditingCollection(collection)
  }

  const handleShare = (collection: Collection) => {
    setSharingCollection(collection)
  }

  const handleDelete = (collection: Collection) => {
    setDeletingCollection(collection)
  }

  const handleEditSubmit = async (values: CollectionFormValues) => {
    if (!editingCollection) return
    await updateMutation.mutateAsync({
      id: editingCollection.id,
      data: values,
    })
    setEditingCollection(null)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingCollection) return
    await deleteMutation.mutateAsync(deletingCollection.id)
    setDeletingCollection(null)
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => (
          <CollectionCard
            key={collection.id}
            collection={collection}
            onEdit={handleEdit}
            onShare={handleShare}
            onDelete={handleDelete}
            showReportButton={true}
          />
        ))}
      </div>

      {editingCollection && (
        <CollectionFormDialog
          mode="edit"
          open
          isPending={updateMutation.isPending}
          initial={{
            name: editingCollection.name,
            description: editingCollection.description ?? undefined,
            visibility: editingCollection.visibility,
            tags: editingCollection.tags,
          }}
          onSubmit={handleEditSubmit}
          onClose={() => setEditingCollection(null)}
        />
      )}

      {sharingCollection && (
        <CollectionShareDialog
          collectionId={sharingCollection.id}
          collectionName={sharingCollection.name}
          open
          onOpenChange={(open: boolean) => !open && setSharingCollection(null)}
        />
      )}

      <CollectionDeleteDialog
        collectionName={deletingCollection?.name}
        isPending={deleteMutation.isPending}
        open={!!deletingCollection}
        onOpenChange={(open: boolean) => !open && setDeletingCollection(null)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  )
}
