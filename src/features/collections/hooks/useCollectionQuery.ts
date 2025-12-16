import { useQuery } from '@tanstack/react-query'
import { collectionsService } from '@/features/collections/services/collections.service'
import { COLLECTIONS_QUERY_KEYS } from './collections.keys'

export function useCollectionQuery(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: COLLECTIONS_QUERY_KEYS.detail(id),
    queryFn: () => collectionsService.get(id),
    enabled: options?.enabled !== false && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}
