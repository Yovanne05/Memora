import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
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
import { CollectionNotesEditDialog } from '../components/collection-notes/CollectionNotesEditDialog'
import { CollectionNotesEmpty } from '../components/collection-notes/CollectionNotesEmpty'
import { CollectionNotesError } from '../components/collection-notes/CollectionNotesError'
import { CollectionNotesHeader } from '../components/collection-notes/CollectionNotesHeader'
import { CollectionNotesList } from '../components/collection-notes/CollectionNotesList'
import { CollectionNotesLoading } from '../components/collection-notes/CollectionNotesLoading'
import { CollectionShareDialog } from '@/features/collections/components/CollectionShareDialog'
import { useDeleteCollectionMutation } from '@/features/collections/hooks/useDeleteCollectionMutation'
import { useCollectionNotesView } from '../hooks/useCollectionNotesView'

interface CollectionNotesViewProps {
  readonly collectionId: string
}

export default function CollectionNotesView({
  collectionId,
}: CollectionNotesViewProps) {
  const router = useRouter()
  const {
    collectionQuery,
    notes,
    total,
    limit,
    isLoading,
    isError,
    error,
    state,
    actions,
    editDialogOpen,
    setEditDialogOpen,
    updateCollectionMutation,
    maxPage,
    handleUpdateCollection,
  } = useCollectionNotesView(collectionId)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const deleteCollectionMutation = useDeleteCollectionMutation()

  const handleDeleteConfirm = async () => {
    await deleteCollectionMutation.mutateAsync(collectionId)
    router.navigate({ to: '/app/workspace' })
  }

  if (collectionQuery.isLoading || isLoading) {
    return <CollectionNotesLoading />
  }

  if (collectionQuery.isError) {
    return <CollectionNotesError title="Collection introuvable" />
  }

  if (isError) {
    return (
      <CollectionNotesError
        title="Erreur lors du chargement des notes"
        message={
          error instanceof Error ? error.message : 'Une erreur est survenue'
        }
      />
    )
  }

  const collection = collectionQuery.data ?? null
  return (
    <div className="space-y-6">
      <CollectionNotesHeader
        collection={collection}
        collectionId={collectionId}
        onEdit={() => setEditDialogOpen(true)}
        onShare={() => setShareDialogOpen(true)}
        onDelete={() => setDeleteDialogOpen(true)}
      />

      {notes && notes.length > 0 ? (
        <CollectionNotesList
          notes={notes}
          page={state.page}
          maxPage={maxPage}
          showPagination={total > limit}
          onPageChange={actions.setPage}
        />
      ) : (
        <CollectionNotesEmpty collectionId={collectionId} />
      )}

      <CollectionNotesEditDialog
        collection={collection}
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSubmit={handleUpdateCollection}
        isPending={updateCollectionMutation.isPending}
      />

      {collection && (
        <CollectionShareDialog
          collectionId={collection.id}
          collectionName={collection.name}
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la collection</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer "{collection?.name}" ? Cette
              action supprimera également toutes les notes contenues dans cette
              collection et est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteCollectionMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCollectionMutation.isPending
                ? 'Suppression...'
                : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
