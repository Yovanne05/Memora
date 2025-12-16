import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { searchService } from '../services/search.service'
import type { SearchFilters } from '../types/search-query'

export function useSearchQuery(params: SearchFilters) {
  return useQuery({
    queryKey: ['search', params],
    queryFn: () => searchService.search(params),
    placeholderData: keepPreviousData,
    enabled: params.query !== undefined && params.query.length >= 2,
  })
}
