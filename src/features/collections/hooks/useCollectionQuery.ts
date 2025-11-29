import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { collectionsService } from '@/features/collections/services/collections.service'
import type { Collection, CollectionUpdate } from '@/features/collections/models/collection.model'
import { collectionsQueryKeys } from './useCollectionsQuery'

export function useCollectionQuery(id: string | undefined) {
  return useQuery({
    queryKey: id ? collectionsQueryKeys.detail(id) : [],
    queryFn: () => collectionsService.get(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  })
}

export function useUpdateCollectionDetailsQuery() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CollectionUpdate }) =>
      collectionsService.update(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(
        collectionsQueryKeys.detail(updated.id),
        updated
      )

      queryClient.setQueryData(
        collectionsQueryKeys.list(),
        (old: Collection[] | undefined) =>
          old?.map((c) => (c.id === updated.id ? updated : c)) ?? []
      )

      queryClient.invalidateQueries({
        queryKey: collectionsQueryKeys.lists(),
      })
    },
    onError: (error) => {
      console.error('Failed to update collection:', error)
    },
  })
}

export function useRefreshCollection(id: string | undefined) {
  const queryClient = useQueryClient()

  return () => {
    if (id) {
      queryClient.refetchQueries({
        queryKey: collectionsQueryKeys.detail(id),
      })
    }
  }
}
