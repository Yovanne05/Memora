import { Loader2, Edit } from "lucide-react"
import { NotesGrid } from "@/features/notes/components/list/NotesGrid"
import { NotesPagination } from "@/features/notes/components/list/NotesPagination"
import { useCollectionQuery } from "@/features/collections/hooks/useCollectionQuery"
import { useWorkspaceNotes } from "../hooks/useWorkspaceNotes"
import { useWorkspaceContext } from "../context/WorkspaceContext"
import { QuickAddNote } from "@/features/notes/components/QuickAddNote"
import { Button } from "@/components/ui/button"
import { CollectionFormDialog } from "@/features/collections/components/dialogs/CollectionFormDialog"
import { useUpdateCollectionMutation } from "@/features/collections/hooks/useUpdateCollectionMutation"
import type { CollectionFormValues } from "@/features/collections/components/forms/CollectionEditForm"
import { useMemo, useEffect, useState } from "react"

interface CollectionNotesViewProps {
  readonly collectionId: string
}

export default function CollectionNotesView({
  collectionId,
}: CollectionNotesViewProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const collectionQuery = useCollectionQuery(collectionId)
  const { notes, total, limit, isLoading, isError, error } = useWorkspaceNotes({
    collectionId,
  })
  const { state, actions } = useWorkspaceContext()
  const updateCollectionMutation = useUpdateCollectionMutation()

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

  const handleUpdateCollection = async (values: CollectionFormValues) => {
    await updateCollectionMutation.mutateAsync({
      id: collectionId,
      data: {
        name: values.name,
        description: values.description,
        visibility: values.visibility,
        tags: values.tags
      }
    })
    setEditDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Collection header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-semibold">{collection?.name}</h2>
          {collection?.description && (
            <p className="mt-1 text-muted-foreground">{collection.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <QuickAddNote
            collectionId={collectionId}
            triggerVariant="default"
            showLabel
          />
          <Button
            variant="outline"
            size="default"
            onClick={() => setEditDialogOpen(true)}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Modifier
          </Button>
        </div>
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
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <div className="text-center">
            <p className="text-lg font-medium">Aucune note dans cette collection</p>
            <p className="text-sm text-muted-foreground mt-1">
              Créez votre première note pour commencer
            </p>
          </div>
          <QuickAddNote
            collectionId={collectionId}
            triggerVariant="default"
            triggerSize="lg"
            showLabel
          />
        </div>
      )}

      {/* Edit Collection Dialog */}
      {collection && (
        <CollectionFormDialog
          mode="edit"
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          onSubmit={handleUpdateCollection}
          isPending={updateCollectionMutation.isPending}
          initial={{
            name: collection.name,
            description: collection.description ?? undefined,
            visibility: collection.visibility,
            tags: collection.tags
          }}
        />
      )}
    </div>
  )
}
