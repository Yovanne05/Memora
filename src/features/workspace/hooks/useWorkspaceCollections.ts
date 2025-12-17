import { useMemo } from "react"
import { useCollectionsListQuery } from "@/features/collections/hooks/useCollectionsListQuery"

export function useWorkspaceCollections() {
  const collectionsQuery = useCollectionsListQuery()

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
