import { Loader2 } from "lucide-react"
import { useWorkspaceCollections } from "../../hooks/useWorkspaceCollections"
import { useWorkspaceContext } from "../../context/WorkspaceContext"
import { useWorkspaceNavigation } from "../../hooks/useWorkspaceNavigation"
import { CollectionTreeItem } from "./CollectionTreeItem"

export function CollectionsTree() {
  const { collections, isLoading, isError } = useWorkspaceCollections()
  const { state, actions } = useWorkspaceContext()
  const { navigateToCollection } = useWorkspaceNavigation()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="px-3 py-2 text-sm text-destructive">
        Erreur lors du chargement des collections
      </div>
    )
  }

  if (!collections || collections.length === 0) {
    return (
      <div className="px-3 py-2 text-sm text-muted-foreground">
        Aucune collection
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {collections.map((collection) => (
        <CollectionTreeItem
          key={collection.id}
          collection={collection}
          isExpanded={state.sidebarExpanded.has(collection.id)}
          isActive={state.selectedCollectionId === collection.id}
          selectedNoteId={state.selectedNoteId}
          onToggle={() => actions.toggleCollection(collection.id)}
          onSelect={() => navigateToCollection(collection.id)}
        />
      ))}
    </div>
  )
}
