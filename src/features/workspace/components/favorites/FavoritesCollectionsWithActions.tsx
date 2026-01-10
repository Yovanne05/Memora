import { useState } from 'react'
import { CollectionsGrid } from '@/features/collections/components/CollectionsGrid'
import { CollectionFormDialog } from '@/features/collections/components/CollectionFormDialog'
import { CollectionShareDialog } from '@/features/collections/components/CollectionShareDialog'
import { useUpdateCollectionMutation } from '@/features/collections/hooks/useUpdateCollectionMutation'
import { useDeleteCollectionMutation } from '@/features/collections/hooks/useDeleteCollectionMutation'
import type { Collection } from '@/features/collections/models/collection.model'
import type { CollectionFormValues } from '@/features/collections/types/collection-form.types'
import { CollectionDeleteDialog } from './CollectionDeleteDialog'

type FavoritesCollectionsProps = {
  collections: Collection[]
}

export function FavoritesCollectionsWithActions({
  collections,
}: Readonly<FavoritesCollectionsProps>) {
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
      <CollectionsGrid
        items={collections}
        onEdit={handleEdit}
        onShare={handleShare}
        onDelete={handleDelete}
      />

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
          onOpenChange={(open) => !open && setSharingCollection(null)}
        />
      )}

      <CollectionDeleteDialog
        collectionName={deletingCollection?.name}
        isPending={deleteMutation.isPending}
        open={!!deletingCollection}
        onOpenChange={(open) => !open && setDeletingCollection(null)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  )
}
