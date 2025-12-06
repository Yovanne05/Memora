import { useMemo, useState } from "react"
import type { CollectionVisibility } from "../models/collection.model"
import type { CollectionsSort, CollectionsTab } from "../lib/collections-query"
import { applyCollectionsQuery } from "../lib/collections-query"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { useCollectionsListQuery } from "./useCollectionsQuery"

export function useCollectionsFilters() {
  const { userId } = useCurrentUser()

  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<CollectionsTab>("mine")
  const [sort, setSort] = useState<CollectionsSort>("recent")
  const [visibilityFilter, setVisibilityFilter] = useState<CollectionVisibility | undefined>(undefined)
  const [showFilters, setShowFilters] = useState(false)

  const collectionsQuery = useCollectionsListQuery()

  const filteredCollections = useMemo(() => {
    if (!userId || !collectionsQuery.data) return []
    return applyCollectionsQuery(collectionsQuery.data, {
      currentUserId: userId,
      tab,
      search,
      sort,
      visibilityFilter,
    })
  }, [collectionsQuery.data, search, sort, tab, userId, visibilityFilter])

  return {
    search,
    setSearch,
    tab,
    setTab,
    sort,
    setSort,
    visibilityFilter,
    setVisibilityFilter,
    showFilters,
    setShowFilters,
    collections: filteredCollections,
    loading: collectionsQuery.isPending,
    error: collectionsQuery.error,
    refetch: collectionsQuery.refetch,
  }
}
