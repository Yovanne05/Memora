import { CollectionsHeader } from "../components/list/CollectionsHeader"
import { CollectionsContent } from "../components/list/CollectionsContent"
import { CollectionDialogs } from "../components/dialogs/CollectionDialogs"
import { CollectionsBulkActions } from "../components/list/CollectionsBulkActions"
import { CollectionsPageActions } from "../components/list/CollectionsPageActions"
import { useCollectionsFilters } from "../hooks/useCollectionsFilters"
import { useCollectionCreate } from "../hooks/useCollectionCreate"
import { useCollectionEdit } from "../hooks/useCollectionEdit"
import { useCollectionDelete } from "../hooks/useCollectionDelete"
import { useCollectionsSelection } from "../hooks/useCollectionsSelection"
import { useCollectionsBulkActions } from "../hooks/useCollectionsBulkActions"
import { useCollectionsKeyboardShortcuts } from "../hooks/useCollectionsKeyboardShortcuts"
import { CollectionsToolbar } from "../components/list/CollectionsToolbar"
import { useRef } from "react"

export function CollectionsListPage() {
  const filters = useCollectionsFilters()
  const create = useCollectionCreate()
  const edit = useCollectionEdit()
  const deletion = useCollectionDelete()
  const selection = useCollectionsSelection()
  const searchInputRef = useRef<HTMLInputElement>(null)

  const bulkActions = useCollectionsBulkActions({
    selectedIds: selection.selectedIds,
    collections: filters.collections,
    onSuccess: selection.exitSelectionMode,
  })

  useCollectionsKeyboardShortcuts({
    onNewCollection: create.open,
    onToggleFilters: () => filters.setShowFilters(!filters.showFilters),
    onToggleSelectionMode: selection.toggleSelectionMode,
    onSearch: () => searchInputRef.current?.focus(),
    disabled: create.isOpen || !!edit.target || !!deletion.target,
  })

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CollectionsHeader />
        <CollectionsPageActions
          selectionMode={selection.selectionMode}
          onToggleSelectionMode={selection.toggleSelectionMode}
          onCreateClick={create.open}
        />
      </div>

      <CollectionsToolbar
        ref={searchInputRef}
        search={filters.search}
        onSearchChange={filters.setSearch}
        tab={filters.tab}
        onTabChange={filters.setTab}
        sort={filters.sort}
        onSortChange={filters.setSort}
        visibilityFilter={filters.visibilityFilter}
        onVisibilityFilterChange={filters.setVisibilityFilter}
        showFilters={filters.showFilters}
        onToggleFilters={() => filters.setShowFilters(!filters.showFilters)}
      />

      <CollectionsContent
        loading={filters.loading}
        error={filters.error?.message ?? null}
        collections={filters.collections}
        onRetry={filters.refetch}
        onEdit={edit.open}
        onDelete={deletion.open}
        isSelected={selection.isSelected}
        onToggleSelection={selection.toggleSelection}
        selectionMode={selection.selectionMode}
      />

      <CollectionsBulkActions
        selectedCount={selection.selectedCount}
        onClearSelection={selection.exitSelectionMode}
        onBulkDelete={bulkActions.deleteSelected}
        onBulkSetPrivate={bulkActions.setPrivate}
        onBulkSetPublic={bulkActions.setPublic}
      />

      <CollectionDialogs
        createOpen={create.isOpen}
        creating={create.loading}
        onCreateSubmit={create.submit}
        onCreateClose={create.close}
        editing={edit.target}
        updating={edit.loading}
        onEditSubmit={edit.submit}
        onEditClose={edit.close}
        deletion={{
          target: deletion.target,
          loading: deletion.loading,
          error: deletion.error?.message ?? null,
          reset: deletion.close,
          confirmDelete: deletion.confirm,
        }}
      />
    </div>
  )
}

export default CollectionsListPage
