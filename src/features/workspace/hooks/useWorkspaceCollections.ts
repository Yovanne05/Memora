import { useMemo } from "react"
import { useCollectionsQuery } from "@/features/collections/hooks/useCollectionsQuery"

export function useWorkspaceCollections() {
  const collectionsQuery = useCollectionsQuery()

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
