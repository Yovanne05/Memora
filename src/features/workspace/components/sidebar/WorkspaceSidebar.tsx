import { Plus, FileText, FolderPlus, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useWorkspaceContext } from "../../context"
import { useWorkspaceNavigation } from "../../hooks/useWorkspaceNavigation"
import { CollectionsTree } from "./CollectionsTree"
import { cn } from "@/lib/utils"
import { useLocation } from "@tanstack/react-router"

export function WorkspaceSidebar() {
  const { state, actions } = useWorkspaceContext()
  const location = useLocation()

  const isFavoritesMode = location.pathname.startsWith("/app/workspace/favorites")
  const mode = isFavoritesMode ? "favorites" : "default"

  const { navigateToAllNotes, navigateToFavorites } = useWorkspaceNavigation(mode)

  return (
    <aside className="flex w-64 flex-col border-r bg-card">
      {/* Actions */}
      <div className="space-y-2 p-4">
        <Button
          onClick={actions.openCreateNote}
          className="w-full justify-start gap-2"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Nouvelle note
        </Button>

        <Button
          onClick={actions.openCreateCollection}
          variant="outline"
          className="w-full justify-start gap-2"
          size="sm"
        >
          <FolderPlus className="h-4 w-4" />
          Nouvelle collection
        </Button>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2" aria-label="Workspace navigation">
        {/* All notes section */}
        <div className="mb-1">
          <button
            type="button"
            onClick={navigateToAllNotes}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              !isFavoritesMode &&
                !state.selectedCollectionId &&
                !state.selectedNoteId &&
                "bg-accent text-accent-foreground"
            )}
          >
            <FileText className="h-4 w-4" />
            Toutes les notes
          </button>
        </div>

        <div className="mb-4">
          <button
            type="button"
            onClick={navigateToFavorites}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              isFavoritesMode && "bg-accent text-accent-foreground"
            )}
          >
            <Star className="h-4 w-4" />
            Mes favoris
          </button>
        </div>

        {/* Collections section */}
        <div>
          <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Collections
          </div>

          <CollectionsTree mode={mode} />
        </div>
      </nav>
    </aside>
  )
}
