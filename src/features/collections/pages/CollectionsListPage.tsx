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
          onClick={manager.handlers.openCreate}
          size="lg"
          className="gap-2"
          aria-label="Créer une nouvelle collection"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Nouvelle collection
        </Button>
      </div>

      <CollectionsToolbar
        search={manager.search}
        onSearchChange={manager.setSearch}
        tab={manager.tab}
        onTabChange={manager.setTab}
        sort={manager.sort}
        onSortChange={manager.setSort}
      />

      <CollectionsContent
        loading={manager.loading}
        error={manager.error}
        collections={manager.collections}
        onRetry={manager.reload}
        onEdit={manager.handlers.startEdit}
        onDelete={manager.deletion.setTarget}
      />

      <CollectionDialogs
        createOpen={manager.createOpen}
        creating={manager.creating}
        onCreateSubmit={manager.handlers.create}
        onCreateClose={manager.handlers.closeCreate}
        editing={manager.editing}
        updating={manager.updating}
        onEditSubmit={manager.handlers.edit}
        onEditClose={manager.handlers.cancelEdit}
        deletion={manager.deletion}
      />
    </div>
  )
}

export default CollectionsListPage
