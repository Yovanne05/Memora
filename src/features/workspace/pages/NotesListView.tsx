import { Loader2 } from "lucide-react"
import { NotesGrid } from "@/features/notes/components/NotesGrid"
import { NotesPagination } from "@/features/notes/components/NotesPagination"
import { useWorkspaceNotes } from "../hooks/useWorkspaceNotes"
import { useWorkspaceContext } from "../context/WorkspaceContext"
import { useMemo } from "react"

export default function NotesListView() {
  const { notes, total, limit, isLoading, isError, error } = useWorkspaceNotes()
  const { state, actions } = useWorkspaceContext()

  const maxPage = useMemo(() => {
    return Math.max(0, Math.ceil(total / limit) - 1)
  }, [total, limit])

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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

  if (!notes || notes.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <p className="text-lg font-medium">Aucune note</p>
        <p className="text-sm text-muted-foreground">
          Créez votre première note pour commencer
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Notes Grid */}
      <NotesGrid items={notes} />

      {/* Pagination */}
      {total > limit && (
        <NotesPagination
          page={state.page}
          maxPage={maxPage}
          setPage={actions.setPage}
        />
      )}
    </div>
  )
}
