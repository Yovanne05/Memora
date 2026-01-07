import { CollectionNotesEditDialog } from "../components/collection-notes/CollectionNotesEditDialog"
import { CollectionNotesEmpty } from "../components/collection-notes/CollectionNotesEmpty"
import { CollectionNotesError } from "../components/collection-notes/CollectionNotesError"
import { CollectionNotesHeader } from "../components/collection-notes/CollectionNotesHeader"
import { CollectionNotesList } from "../components/collection-notes/CollectionNotesList"
import { CollectionNotesLoading } from "../components/collection-notes/CollectionNotesLoading"
import { useCollectionNotesView } from "../hooks/useCollectionNotesView"

interface CollectionNotesViewProps {
  readonly collectionId: string
}

export default function CollectionNotesView({
  collectionId,
}: CollectionNotesViewProps) {
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
        message={error instanceof Error ? error.message : "Une erreur est survenue"}
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
    </div>
  )
}



