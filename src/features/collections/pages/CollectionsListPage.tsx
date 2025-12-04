import { CollectionsHeader } from "../components/list/CollectionsHeader"
import { CollectionsContent } from "../components/list/CollectionsContent"
import { CollectionDialogs } from "../components/dialogs/CollectionDialogs"
import { CollectionsBulkActions } from "../components/list/CollectionsBulkActions"
import { CollectionsPageActions } from "../components/list/CollectionsPageActions"
import { useCollectionsManager } from "../hooks/useCollectionsManager"
import { useCollectionsSelection } from "../hooks/useCollectionsSelection"
import { useCollectionsBulkActions } from "../hooks/useCollectionsBulkActions"
import { useCollectionsKeyboardShortcuts } from "../hooks/useCollectionsKeyboardShortcuts"
import { CollectionsToolbar } from "../components/list/CollectionsToolbar"
import { useRef } from "react"

export function CollectionsListPage() {
  const manager = useCollectionsManager()
  const selection = useCollectionsSelection()
  const searchInputRef = useRef<HTMLInputElement>(null)

  const bulkActions = useCollectionsBulkActions({
    selectedIds: selection.selectedIds,
    collections: manager.collections,
    onSuccess: selection.exitSelectionMode,
  })

  useCollectionsKeyboardShortcuts({
    onNewCollection: manager.create.open,
    onToggleFilters: () => manager.filters.setShowFilters(!manager.filters.showFilters),
    onToggleSelectionMode: selection.toggleSelectionMode,
    onSearch: () => searchInputRef.current?.focus(),
    disabled: manager.create.isOpen || !!manager.edit.target || !!manager.deletion.target,
  })

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CollectionsHeader />
        <CollectionsPageActions
          selectionMode={selection.selectionMode}
          onToggleSelectionMode={selection.toggleSelectionMode}
          onCreateClick={manager.create.open}
        />
      </div>

      <CollectionsToolbar
        ref={searchInputRef}
        search={manager.filters.search}
        onSearchChange={manager.filters.setSearch}
        tab={manager.filters.tab}
        onTabChange={manager.filters.setTab}
        sort={manager.filters.sort}
        onSortChange={manager.filters.setSort}
        visibilityFilter={manager.filters.visibilityFilter}
        onVisibilityFilterChange={manager.filters.setVisibilityFilter}
        showFilters={manager.filters.showFilters}
        onToggleFilters={() => manager.filters.setShowFilters(!manager.filters.showFilters)}
      />

      <CollectionsContent
        loading={manager.loading}
        error={manager.error?.message ?? null}
        collections={manager.collections}
        onRetry={manager.refetch}
        onEdit={manager.edit.open}
        onDelete={manager.deletion.open}
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
        createOpen={manager.create.isOpen}
        creating={manager.create.loading}
        onCreateSubmit={manager.create.submit}
        onCreateClose={manager.create.close}
        editing={manager.edit.target}
        updating={manager.edit.loading}
        onEditSubmit={manager.edit.submit}
        onEditClose={manager.edit.close}
        deletion={{
          target: manager.deletion.target,
          loading: manager.deletion.loading,
          error: manager.deletion.error?.message ?? null,
          reset: manager.deletion.close,
          confirmDelete: manager.deletion.confirm,
        }}
      />
    </div>
  )
}

export default CollectionsListPage
