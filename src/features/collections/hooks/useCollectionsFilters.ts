import { useCallback, useMemo, useState } from "react"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import type { CollectionsSort, CollectionsTab } from "../lib/collections-query"
import { applyCollectionsQuery } from "../lib/collections-query"
import type { CollectionVisibility } from "../models/collection.model"
import { useCollectionsListQuery } from "./useCollectionsListQuery"

const DEFAULT_LIMIT = 12

export function useCollectionsFilters() {
  const { userId } = useCurrentUser()

  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<CollectionsTab>("mine")
  const [sort, setSort] = useState<CollectionsSort>("recent")
  const [visibilityFilter, setVisibilityFilter] = useState<CollectionVisibility | undefined>(undefined)
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(0)

  const collectionsQuery = useCollectionsListQuery()

  const filteredCollections = useMemo(() => {
    if (!userId || !collectionsQuery.data) return []
    return applyCollectionsQuery(collectionsQuery.data.items, {
      currentUserId: userId,
      tab,
      search,
      sort,
      visibilityFilter,
    })
  }, [collectionsQuery.data, search, sort, tab, userId, visibilityFilter])

  const total = filteredCollections.length
  const maxPage = useMemo(
    () => Math.max(0, Math.ceil(total / DEFAULT_LIMIT) - 1),
    [total]
  )

  const paginatedCollections = useMemo(() => {
    const start = page * DEFAULT_LIMIT
    const end = start + DEFAULT_LIMIT
    return filteredCollections.slice(start, end)
  }, [filteredCollections, page])

  const handleSetSearch = useCallback((value: string) => {
    setSearch(value)
    setPage(0)
  }, [])

  const handleSetTab = useCallback((value: CollectionsTab) => {
    setTab(value)
    setPage(0)
  }, [])

  const handleSetSort = useCallback((value: CollectionsSort) => {
    setSort(value)
    setPage(0)
  }, [])

  const handleSetVisibilityFilter = useCallback((value: CollectionVisibility | undefined) => {
    setVisibilityFilter(value)
    setPage(0)
  }, [])

  return {
    search,
    setSearch: handleSetSearch,
    tab,
    setTab: handleSetTab,
    sort,
    setSort: handleSetSort,
    visibilityFilter,
    setVisibilityFilter: handleSetVisibilityFilter,
    showFilters,
    setShowFilters,
    collections: paginatedCollections,
    total,
    loading: collectionsQuery.isPending,
    error: collectionsQuery.error,
    refetch: collectionsQuery.refetch,
    pagination: {
      page,
      setPage,
      maxPage,
      limit: DEFAULT_LIMIT,
    },
  }
}
