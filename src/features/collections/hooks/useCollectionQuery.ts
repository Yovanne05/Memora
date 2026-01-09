import { useQuery } from '@tanstack/react-query'
import { collectionsService } from '@/features/collections/services/collections.service'
import { COLLECTIONS_QUERY_KEYS } from './collections.keys'
import { ApiError } from '@/lib/errors'

export function useCollectionQuery(
  id: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: COLLECTIONS_QUERY_KEYS.detail(id),
    queryFn: () => collectionsService.get(id),
    enabled: options?.enabled !== false && !!id,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status >= 500) {
        return false
      }
      return failureCount < 2
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}
