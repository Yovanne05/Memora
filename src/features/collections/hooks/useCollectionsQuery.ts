import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { collectionsService } from '@/features/collections/services/collections.service'
import type { Collection, CollectionCreate, CollectionUpdate } from '@/features/collections/models/collection.model'

export const COLLECTIONS_QUERY_KEYS = {
  all: ['collections'] as const,
  lists: () => [...COLLECTIONS_QUERY_KEYS.all, 'list'] as const,
  list: (filters: Record<string, unknown> = {}) => [
    ...COLLECTIONS_QUERY_KEYS.lists(),
    filters,
  ] as const,
  details: () => [...COLLECTIONS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...COLLECTIONS_QUERY_KEYS.details(), id] as const,
}


export function useCollectionsListQuery() {
  return useQuery({
    queryKey: COLLECTIONS_QUERY_KEYS.list(),
    queryFn: () => collectionsService.list(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  })
}

export function useCollectionQuery(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: COLLECTIONS_QUERY_KEYS.detail(id),
    queryFn: () => collectionsService.get(id),
    enabled: options?.enabled !== false && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}


interface MutationCallbacks<TData = void> {
  onSuccess?: (data: TData) => void
  onError?: (error: Error) => void
}


export function useCreateCollectionMutation(callbacks?: MutationCallbacks<Collection>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CollectionCreate) => collectionsService.create(data),
    onSuccess: (newCollection) => {
      queryClient.setQueryData(
        COLLECTIONS_QUERY_KEYS.list(),
        (old: Collection[] | undefined) => [newCollection, ...(old ?? [])]
      )

      queryClient.invalidateQueries({
        queryKey: COLLECTIONS_QUERY_KEYS.lists(),
      })

      callbacks?.onSuccess?.(newCollection)
    },
    onError: (error: Error) => {
      console.error('Failed to create collection:', error)
      callbacks?.onError?.(error)
    },
  })
}

export function useUpdateCollectionMutation(callbacks?: MutationCallbacks<Collection>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CollectionUpdate }) =>
      collectionsService.update(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(
        COLLECTIONS_QUERY_KEYS.list(),
        (old: Collection[] | undefined) =>
          old?.map((c) => (c.id === updated.id ? updated : c)) ?? []
      )

      queryClient.setQueryData(
        COLLECTIONS_QUERY_KEYS.detail(updated.id),
        updated
      )

      queryClient.invalidateQueries({
        queryKey: COLLECTIONS_QUERY_KEYS.lists(),
      })
      queryClient.invalidateQueries({
        queryKey: COLLECTIONS_QUERY_KEYS.detail(updated.id),
      })

      callbacks?.onSuccess?.(updated)
    },
    onError: (error: Error) => {
      console.error('Failed to update collection:', error)
      callbacks?.onError?.(error)
    },
  })
}

export function useDeleteCollectionMutation(callbacks?: MutationCallbacks<void>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => collectionsService.remove(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(
        COLLECTIONS_QUERY_KEYS.list(),
        (old: Collection[] | undefined) =>
          old?.filter((c) => c.id !== id) ?? []
      )

      queryClient.removeQueries({
        queryKey: COLLECTIONS_QUERY_KEYS.detail(id),
      })

      queryClient.invalidateQueries({
        queryKey: COLLECTIONS_QUERY_KEYS.lists(),
      })

      callbacks?.onSuccess?.()
    },
    onError: (error: Error) => {
      console.error('Failed to delete collection:', error)
      callbacks?.onError?.(error)
    },
  })
}
