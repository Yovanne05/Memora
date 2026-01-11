import { useQuery } from '@tanstack/react-query'
import { defaultQueryConfig } from '@/lib/query-config'
import { collectionsService } from '@/features/collections/services/collections.service'
import { COLLECTIONS_QUERY_KEYS } from './collections.keys'

export function useCollectionQuery(
  id: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: COLLECTIONS_QUERY_KEYS.detail(id),
    queryFn: () => collectionsService.get(id),
    ...defaultQueryConfig,
    enabled: options?.enabled !== false && !!id,
  })
}
