import { useMemo } from 'react'
import { useCollectionsQuery } from '@/features/collections/hooks/useCollectionsQuery'
import { useWorkspaceAccessScope } from './useWorkspaceAccessScope'

export type WorkspaceMode = 'default' | 'favorites'
const FETCH_LIMIT = 200

interface UseWorkspaceCollectionsOptions {
  mode?: WorkspaceMode
}

export function useWorkspaceCollections(
  options: UseWorkspaceCollectionsOptions = {}
) {
  const mode = options.mode ?? 'default'
  const {
    userId,
    sharedCollectionIds,
    isLoading: isAccessLoading,
    isError: isAccessError,
    error: accessError,
  } = useWorkspaceAccessScope()

  const collectionsQuery = useCollectionsQuery(
    mode === 'favorites'
      ? { isFavorite: true, limit: FETCH_LIMIT }
      : { limit: FETCH_LIMIT }
  )

  const scopedCollections = useMemo(() => {
    const items = collectionsQuery.data?.items ?? []
    if (!userId) return items

    return items.filter(
      (collection) =>
        collection.ownerId === userId || sharedCollectionIds.has(collection.id)
    )
  }, [collectionsQuery.data?.items, sharedCollectionIds, userId])

  const collectionsTree = useMemo(() => {
    return scopedCollections.map((collection) => ({
      ...collection,
      notesCount: collection.notesCount ?? 0,
    }))
  }, [scopedCollections])

  return {
    collections: collectionsTree,
    isLoading: collectionsQuery.isLoading || isAccessLoading,
    isError: collectionsQuery.isError || isAccessError,
    error: collectionsQuery.error ?? accessError,
  }
}
