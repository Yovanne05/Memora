import { CollectionNotesEditDialog } from "./collection-notes-view/CollectionNotesEditDialog"
import { CollectionNotesEmpty } from "./collection-notes-view/CollectionNotesEmpty"
import { CollectionNotesError } from "./collection-notes-view/CollectionNotesError"
import { CollectionNotesHeader } from "./collection-notes-view/CollectionNotesHeader"
import { CollectionNotesList } from "./collection-notes-view/CollectionNotesList"
import { CollectionNotesLoading } from "./collection-notes-view/CollectionNotesLoading"
import { useCollectionNotesView } from "./collection-notes-view/useCollectionNotesView"

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
