import { forwardRef } from "react"

import type { CollectionsSort, CollectionsTab } from "../lib/collections-query"
import type { CollectionVisibility } from "../models/collection.model"
import { CollectionsFilterButton } from "./collections-toolbar/CollectionsFilterButton"
import { CollectionsSearchInput } from "./collections-toolbar/CollectionsSearchInput"
import { CollectionsSortSelect } from "./collections-toolbar/CollectionsSortSelect"
import { CollectionsTabs } from "./collections-toolbar/CollectionsTabs"
import { CollectionsVisibilityFilters } from "./collections-toolbar/CollectionsVisibilityFilters"

interface CollectionsToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  tab: CollectionsTab
  onTabChange: (value: CollectionsTab) => void
  sort: CollectionsSort
  onSortChange: (value: CollectionsSort) => void
  visibilityFilter?: CollectionVisibility
  onVisibilityFilterChange: (value: CollectionVisibility | undefined) => void
  showFilters: boolean
  onToggleFilters: () => void
}

export const CollectionsToolbar = forwardRef<
  HTMLInputElement,
  CollectionsToolbarProps
>(function CollectionsToolbar(
  {
    search,
    onSearchChange,
    tab,
    onTabChange,
    sort,
    onSortChange,
    visibilityFilter,
    onVisibilityFilterChange,
    showFilters,
    onToggleFilters,
  },
  ref
) {
  const activeFiltersCount = visibilityFilter ? 1 : 0

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <CollectionsSearchInput ref={ref} value={search} onChange={onSearchChange} />

        <div className="flex flex-wrap items-center gap-3">
          <CollectionsTabs tab={tab} onChange={onTabChange} />
          <CollectionsSortSelect value={sort} onChange={onSortChange} />
          <CollectionsFilterButton
            showFilters={showFilters}
            activeFiltersCount={activeFiltersCount}
            onToggle={onToggleFilters}
          />
        </div>
      </div>

      {showFilters && (
        <CollectionsVisibilityFilters
          visibilityFilter={visibilityFilter}
          onChange={onVisibilityFilterChange}
          activeFiltersCount={activeFiltersCount}
        />
      )}
    </div>
  )
})
