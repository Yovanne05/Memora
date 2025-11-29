import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { collectionsService } from '@/features/collections/services/collections.service'
import type { Collection, CollectionCreate, CollectionUpdate } from '@/features/collections/models/collection.model'

const COLLECTIONS_QUERY_KEYS = {
  all: ['collections'] as const,
  lists: () => [...COLLECTIONS_QUERY_KEYS.all, 'list'] as const,
  list: (filters: Record<string, unknown> = {}) => [
    ...COLLECTIONS_QUERY_KEYS.lists(),
    filters,
  ] as const,
  details: () => [...COLLECTIONS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...COLLECTIONS_QUERY_KEYS.details(), id] as const,
}

export function useCollectionsQuery() {
  return useQuery({
    queryKey: COLLECTIONS_QUERY_KEYS.list(),
    queryFn: () => collectionsService.list(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  })
}

export function useCreateCollectionMutation(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CollectionCreate) => collectionsService.create(data),
    onSuccess: (newCollection) => {
      // Update the collections list in cache
      queryClient.setQueryData(
        COLLECTIONS_QUERY_KEYS.list(),
        (old: Collection[] | undefined) => [newCollection, ...(old ?? [])]
      )

      // Invalidate to ensure consistency
      queryClient.invalidateQueries({
        queryKey: COLLECTIONS_QUERY_KEYS.lists(),
      })

      // Call the provided onSuccess callback
      options?.onSuccess?.()
    },
    onError: (error) => {
      console.error('Failed to create collection:', error)
    },
  })
}

export function useUpdateCollectionMutation(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CollectionUpdate }) =>
      collectionsService.update(id, data),
    onSuccess: (updated) => {
      // Update the collections list in cache
      queryClient.setQueryData(
        COLLECTIONS_QUERY_KEYS.list(),
        (old: Collection[] | undefined) =>
          old?.map((c) => (c.id === updated.id ? updated : c)) ?? []
      )

      // Update the detail cache if it exists
      queryClient.setQueryData(
        COLLECTIONS_QUERY_KEYS.detail(updated.id),
        updated
      )

      // Invalidate to ensure consistency
      queryClient.invalidateQueries({
        queryKey: COLLECTIONS_QUERY_KEYS.lists(),
      })

      // Call the provided onSuccess callback
      options?.onSuccess?.()
    },
    onError: (error) => {
      console.error('Failed to update collection:', error)
    },
  })
}

export function useDeleteCollectionMutation(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => collectionsService.remove(id),
    onSuccess: (_, id) => {
      // Remove from the collections list in cache
      queryClient.setQueryData(
        COLLECTIONS_QUERY_KEYS.list(),
        (old: Collection[] | undefined) =>
          old?.filter((c) => c.id !== id) ?? []
      )

      // Remove the detail cache
      queryClient.removeQueries({
        queryKey: COLLECTIONS_QUERY_KEYS.detail(id),
      })

      // Invalidate to ensure consistency
      queryClient.invalidateQueries({
        queryKey: COLLECTIONS_QUERY_KEYS.lists(),
      })

      // Call the provided onSuccess callback
      options?.onSuccess?.()
    },
    onError: (error) => {
      console.error('Failed to delete collection:', error)
    },
  })
}

export const collectionsQueryKeys = COLLECTIONS_QUERY_KEYS
