import { Plus, FolderPlus, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useWorkspaceContext } from '../../context'
import { useWorkspaceNavigation } from '../../hooks/useWorkspaceNavigation'
import { CollectionsTree } from './CollectionsTree'
import { AllNotesDroppable } from './AllNotesDroppable'
import { cn } from '@/lib/utils'
import { useLocation } from '@tanstack/react-router'

export function WorkspaceSidebar() {
  const { state, actions } = useWorkspaceContext()
  const location = useLocation()

  const isFavoritesMode = location.pathname.startsWith(
    '/app/workspace/favorites'
  )
  const mode = isFavoritesMode ? 'favorites' : 'default'

  const { navigateToAllNotes, navigateToFavorites } =
    useWorkspaceNavigation(mode)

  return (
    <>
      {/* Overlay */}
      {state.sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={actions.closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-transform duration-300',
          state.sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
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
        <nav
          className="flex-1 overflow-y-auto p-2"
          aria-label="Workspace navigation"
        >
          {/* All notes section */}
          <div className="mb-1">
            <AllNotesDroppable
              isActive={
                !isFavoritesMode &&
                !state.selectedCollectionId &&
                !state.selectedNoteId
              }
              onClick={navigateToAllNotes}
            />
          </div>

          <div className="mb-4">
            <button
              type="button"
              onClick={navigateToFavorites}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                isFavoritesMode && 'bg-accent text-accent-foreground'
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
    </>
  )
}
