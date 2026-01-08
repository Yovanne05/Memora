import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { CollectionsGrid } from '@/features/collections/components/CollectionsGrid'
import { CollectionFormDialog } from '@/features/collections/components/CollectionFormDialog'
import { CollectionShareDialog } from '@/features/collections/components/CollectionShareDialog'
import { useUpdateCollectionMutation } from '@/features/collections/hooks/useUpdateCollectionMutation'
import { useDeleteCollectionMutation } from '@/features/collections/hooks/useDeleteCollectionMutation'
import type { Collection } from '@/features/collections/models/collection.model'
import type { CollectionFormValues } from '@/features/collections/types/collection-form.types'

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
      collectionId: editingCollection.id,
      payload: values,
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
          initial={editingCollection}
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

      <AlertDialog
        open={!!deletingCollection}
        onOpenChange={(open) => !open && setDeletingCollection(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la collection</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer "{deletingCollection?.name}" ?
              Cette action supprimera également toutes les notes contenues dans
              cette collection et est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
