import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { searchService } from '../services/search.service'
import type { SearchParams } from '../types/search.types'

export function useSearchQuery(params: SearchParams) {
  return useQuery({
    queryKey: ['search', params],
    queryFn: () => searchService.search(params),
    placeholderData: keepPreviousData,
    enabled: params.query !== undefined && params.query.length >= 2,
  })
}
