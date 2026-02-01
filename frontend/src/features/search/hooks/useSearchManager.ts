import { useState, useMemo, useCallback } from 'react'
import { useSearchQuery } from './useSearchQuery'
import { useDebounce } from '@/hooks/useDebounce'
import type { SearchFilters } from '../types/search-query'

const DEFAULT_LIMIT = 20

export function useSearchManager() {
  const [page, setPage] = useState(0)
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<SearchFilters>({
    type: 'all',
    sortBy: 'date',
    sortDir: 'desc',
    tags: [],
  })

  const debouncedQuery = useDebounce(query, 300)

  const searchParams = useMemo(
    () => ({
      ...filters,
      query: debouncedQuery,
      limit: DEFAULT_LIMIT,
      offset: page * DEFAULT_LIMIT,
    }),
    [filters, debouncedQuery, page]
  )

  const { data, isLoading, error } = useSearchQuery(searchParams)

  const totalPages = useMemo(
    () => (data?.total ? Math.ceil(data.total / DEFAULT_LIMIT) : 0),
    [data]
  )

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
    setPage(0)
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({
      type: 'all',
      sortBy: 'date',
      sortDir: 'desc',
      tags: [],
    })
    setPage(0)
  }, [])

  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery)
    setPage(0)
  }, [])

  const hasSearched = debouncedQuery.length >= 2

  return {
    query,
    setQuery: handleSearch,
    filters,
    updateFilters,
    resetFilters,
    page,
    setPage,
    totalPages,
    limit: DEFAULT_LIMIT,
    results: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    hasSearched,
    isEmpty: hasSearched && !isLoading && (data?.items.length ?? 0) === 0,
  }
}
