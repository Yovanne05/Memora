import { useMemo } from "react"
import { useCollectionsQuery } from "@/features/collections/hooks/useCollectionsQuery"

export type WorkspaceMode = "default" | "favorites"

interface UseWorkspaceCollectionsOptions {
  mode?: WorkspaceMode
}

export function useWorkspaceCollections(options: UseWorkspaceCollectionsOptions = {}) {
  const mode = options.mode ?? "default"

  const collectionsQuery = useCollectionsQuery(
    mode === "favorites" ? { isFavorite: true } : {}
  )

  const collectionsTree = useMemo(() => {
    if (!collectionsQuery.data?.items) {
      return []
    }

    return collectionsQuery.data.items.map((collection) => ({
      ...collection,
      notesCount: collection.notesCount || 0,
    }))
  }, [collectionsQuery.data])

  return {
    collections: collectionsTree,
    isLoading: collectionsQuery.isLoading,
    isError: collectionsQuery.isError,
    error: collectionsQuery.error,
  }
}
