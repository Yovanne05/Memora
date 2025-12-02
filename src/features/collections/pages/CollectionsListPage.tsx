import { Plus, CheckSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CollectionsHeader } from "../components/list/CollectionsHeader"
import { CollectionsContent } from "../components/list/CollectionsContent"
import { CollectionDialogs } from "../components/dialogs/CollectionDialogs"
import { CollectionsBulkActions } from "../components/list/CollectionsBulkActions"
import { CollectionsKeyboardHelp } from "../components/list/CollectionsKeyboardHelp"
import { useCollectionsManager } from "../hooks/useCollectionsManager"
import { useCollectionsSelection } from "../hooks/useCollectionsSelection"
import { useCollectionsKeyboardShortcuts } from "../hooks/useCollectionsKeyboardShortcuts"
import { CollectionsToolbar } from "../components/list/CollectionsToolbar"
import { useState, useCallback, useRef } from "react"

export function CollectionsListPage() {
  const manager = useCollectionsManager()
  const selection = useCollectionsSelection()
  const [selectionMode, setSelectionMode] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const handleToggleSelectionMode = useCallback(() => {
    setSelectionMode((prev) => !prev)
    if (selectionMode) {
      selection.clearSelection()
    }
  }, [selectionMode, selection])

  const handleBulkDelete = useCallback(async () => {
    // TODO: Implémenter la suppression groupée
    console.log("Bulk delete:", selection.selectedIds)
    selection.clearSelection()
    setSelectionMode(false)
  }, [selection])

  const handleBulkSetPrivate = useCallback(async () => {
    // TODO: Implémenter le changement de visibilité groupé
    console.log("Set private:", selection.selectedIds)
    selection.clearSelection()
    setSelectionMode(false)
  }, [selection])

  const handleBulkSetPublic = useCallback(async () => {
    // TODO: Implémenter le changement de visibilité groupé
    console.log("Set public:", selection.selectedIds)
    selection.clearSelection()
    setSelectionMode(false)
  }, [selection])

  const handleFocusSearch = useCallback(() => {
    const searchInput = document.querySelector<HTMLInputElement>('input[placeholder*="Rechercher"]')
    searchInput?.focus()
  }, [])

  useCollectionsKeyboardShortcuts({
    onNewCollection: manager.create.open,
    onToggleFilters: () => manager.filters.setShowFilters(!manager.filters.showFilters),
    onToggleSelectionMode: handleToggleSelectionMode,
    onSearch: handleFocusSearch,
    disabled: manager.create.isOpen || !!manager.edit.target || !!manager.deletion.target,
  })

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CollectionsHeader />
        <div className="flex gap-2">
          <CollectionsKeyboardHelp />
          <Button
            onClick={handleToggleSelectionMode}
            size="lg"
            variant={selectionMode ? "default" : "outline"}
            className="gap-2"
            aria-label="Mode sélection"
          >
            <CheckSquare className="h-4 w-4" aria-hidden="true" />
            {selectionMode ? "Annuler" : "Sélectionner"}
          </Button>
          <Button
            onClick={manager.create.open}
            size="lg"
            className="gap-2"
            aria-label="Créer une nouvelle collection"
            disabled={selectionMode}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nouvelle collection
          </Button>
        </div>
      </div>

      <CollectionsToolbar
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
        selectionMode={selectionMode}
      />

      <CollectionsBulkActions
        selectedCount={selection.selectedCount}
        onClearSelection={() => {
          selection.clearSelection()
          setSelectionMode(false)
        }}
        onBulkDelete={handleBulkDelete}
        onBulkSetPrivate={handleBulkSetPrivate}
        onBulkSetPublic={handleBulkSetPublic}
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
