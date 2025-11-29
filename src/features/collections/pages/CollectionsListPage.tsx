import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CollectionsHeader } from "../components/CollectionsHeader"
import { CollectionsToolbar } from "../components/CollectionsToolbar"
import { CollectionsContent } from "../components/CollectionsContent"
import { CollectionDialogs } from "../components/CollectionDialogs"
import { useCollectionsManager } from "../hooks/useCollectionsManager"

export function CollectionsListPage() {
  const manager = useCollectionsManager()

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CollectionsHeader />
        <Button
          onClick={manager.create.open}
          size="lg"
          className="gap-2"
          aria-label="Créer une nouvelle collection"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Nouvelle collection
        </Button>
      </div>

      <CollectionsToolbar
        search={manager.filters.search}
        onSearchChange={manager.filters.setSearch}
        tab={manager.filters.tab}
        onTabChange={manager.filters.setTab}
        sort={manager.filters.sort}
        onSortChange={manager.filters.setSort}
      />

      <CollectionsContent
        loading={manager.loading}
        error={manager.error?.message ?? null}
        collections={manager.collections}
        onRetry={manager.refetch}
        onEdit={manager.edit.open}
        onDelete={manager.deletion.open}
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
