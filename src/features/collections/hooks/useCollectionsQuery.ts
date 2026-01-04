import { useQuery } from '@tanstack/react-query'
import { collectionsService } from '@/features/collections/services/collections.service'
import { COLLECTIONS_QUERY_KEYS } from './collections.keys'

export function useCollectionsQuery() {
  return useQuery({
    queryKey: COLLECTIONS_QUERY_KEYS.list(),
    queryFn: () => collectionsService.list(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  })
}
