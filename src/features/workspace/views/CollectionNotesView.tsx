import { Loader2 } from "lucide-react"
import { NotesGrid } from "@/features/notes/components/list/NotesGrid"
import { NotesPagination } from "@/features/notes/components/list/NotesPagination"
import { useCollectionQuery } from "@/features/collections/hooks/useCollectionQuery"
import { useWorkspaceNotes } from "../hooks/useWorkspaceNotes"
import { useWorkspaceContext } from "../context/WorkspaceContext"
import { useMemo, useEffect } from "react"

interface CollectionNotesViewProps {
  readonly collectionId: string
}

export default function CollectionNotesView({
  collectionId,
}: CollectionNotesViewProps) {
  const collectionQuery = useCollectionQuery(collectionId)
  const { notes, total, limit, isLoading, isError, error } = useWorkspaceNotes({
    collectionId,
  })
  const { state, actions } = useWorkspaceContext()

  // Update selected collection in context
  useEffect(() => {
    actions.selectCollection(collectionId)
  }, [collectionId, actions])

  const maxPage = useMemo(() => {
    return Math.max(0, Math.ceil(total / limit) - 1)
  }, [total, limit])

  if (collectionQuery.isLoading || isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (collectionQuery.isError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <p className="text-destructive">Collection introuvable</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <p className="text-destructive">
          Erreur lors du chargement des notes
        </p>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Une erreur est survenue"}
        </p>
      </div>
    )
  }

  const collection = collectionQuery.data

  return (
    <div className="space-y-6">
      {/* Collection header */}
      <div>
        <h2 className="text-2xl font-semibold">{collection?.name}</h2>
        {collection?.description && (
          <p className="mt-1 text-muted-foreground">{collection.description}</p>
        )}
      </div>

      {/* Notes Grid */}
      {notes && notes.length > 0 ? (
        <>
          <NotesGrid items={notes} />

          {/* Pagination */}
          {total > limit && (
            <NotesPagination
              page={state.page}
              maxPage={maxPage}
              setPage={actions.setPage}
            />
          )}
        </>
      ) : (
        <div className="flex h-64 flex-col items-center justify-center gap-2">
          <p className="text-lg font-medium">Aucune note dans cette collection</p>
          <p className="text-sm text-muted-foreground">
            Créez une note pour commencer
          </p>
        </div>
      )}
    </div>
  )
}
