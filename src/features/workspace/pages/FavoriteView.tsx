import { useMemo } from "react"
import { Loader2 } from "lucide-react"
import { useWorkspaceContext } from "../context/WorkspaceContext"
import { NotesGrid } from "@/features/notes/components/NotesGrid"
import { CollectionsGrid } from "@/features/collections/components/CollectionsGrid"
import { useNotesQuery } from "@/features/notes/hooks/useNotesQuery"
import { useCollectionsQuery } from "@/features/collections/hooks/useCollectionsQuery"
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

  const collectionFilters = useMemo(() => {
    const sort = SORT_MAP[state.sort] ?? SORT_MAP.recent
    return {
      sortBy: sort.sortBy === "title" ? ("title" as const) : ("updated_at" as const),
      sortDir: sort.sortDir,
      titleContains: state.search.trim() || undefined,
      isFavorite: true,
    }
  }, [state.search, state.sort])

  const notesQuery = useNotesQuery(state.page, state.limit, filters)
  const collectionsQuery = useCollectionsQuery(collectionFilters)

  const isLoading = notesQuery.isLoading || collectionsQuery.isLoading
  const isError = notesQuery.isError || collectionsQuery.isError

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError) {
    let errorMessage = "Une erreur est survenue"
    if (notesQuery.error instanceof Error) {
      errorMessage = notesQuery.error.message
    } else if (collectionsQuery.error instanceof Error) {
      errorMessage = collectionsQuery.error.message
    }

    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <p className="text-destructive">Erreur lors du chargement des favoris</p>
        <p className="text-sm text-muted-foreground">{errorMessage}</p>
      </div>
    )
  }

  const notes = notesQuery.data?.items ?? []
  const collections = collectionsQuery.data?.items ?? []
  const hasContent = notes.length > 0 || collections.length > 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Mes favoris</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Collections et notes que vous avez ajoutées en favoris.
        </p>
      </div>

      {hasContent ? (
        <>
          {collections.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-medium">Collections</h2>
              <CollectionsGrid items={collections} />
            </div>
          )}

          {notes.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-medium">Notes</h2>
              <NotesGrid items={notes} showQuickActions showFavoriteButton />
            </div>
          )}
        </>
      ) : (
        <div className="flex h-64 flex-col items-center justify-center gap-2">
          <p className="text-lg font-medium">Aucun favori</p>
          <p className="text-sm text-muted-foreground">
            Ajoutez des collections et des notes en favoris pour les retrouver ici.
          </p>
        </div>
      )}
    </div>
  )
}