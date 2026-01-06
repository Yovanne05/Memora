import { useMemo } from "react"
import { Loader2 } from "lucide-react"
import { useWorkspaceContext } from "../context/WorkspaceContext"
import { NotesGrid } from "@/features/notes/components/NotesGrid"
import { useNotesQuery } from "@/features/notes/hooks/useNotesQuery"
import type { NotesFilters } from "@/features/notes/types/note-query"

const SORT_MAP = {
  recent: { sortBy: "updated_at" as const, sortDir: "desc" as const },
  oldest: { sortBy: "updated_at" as const, sortDir: "asc" as const },
  "title-asc": { sortBy: "title" as const, sortDir: "asc" as const },
  "title-desc": { sortBy: "title" as const, sortDir: "desc" as const },
}

export default function FavoritesView() {
  const { state } = useWorkspaceContext()

  const filters = useMemo<NotesFilters>(() => {
    const sort = SORT_MAP[state.sort] ?? SORT_MAP.recent
    return {
      ...sort,
      titleContains: state.search.trim() || undefined,
      isFavorite: true,
    }
  }, [state.search, state.sort])

  const notesQuery = useNotesQuery(state.page, state.limit, filters)

  if (notesQuery.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (notesQuery.isError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <p className="text-destructive">Erreur lors du chargement des favoris</p>
        <p className="text-sm text-muted-foreground">
          {notesQuery.error instanceof Error
            ? notesQuery.error.message
            : "Une erreur est survenue"}
        </p>
      </div>
    )
  }

  const notes = notesQuery.data?.items ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Mes favoris</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Notes que vous avez ajoutées en favoris.
        </p>
      </div>

      {notes.length > 0 ? (
      <NotesGrid items={notes} mode="favorites" />
      ) : (
        <div className="flex h-64 flex-col items-center justify-center gap-2">
          <p className="text-lg font-medium">Aucune note en favoris</p>
          <p className="text-sm text-muted-foreground">
            Ajoutez des notes en favoris pour les retrouver ici.
          </p>
        </div>
      )}
    </div>
  )
}