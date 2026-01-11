import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWorkspaceContext } from '../context'
import { WorkspaceBreadcrumb } from './workspace-header/WorkspaceBreadcrumb'
import { WorkspaceGraphButton } from './workspace-header/WorkspaceGraphButton'
import { WorkspaceSearch } from './workspace-header/WorkspaceSearch'
import { WorkspaceViewToggle } from './workspace-header/WorkspaceViewToggle'
import { useWorkspaceBreadcrumbs } from '../hooks/useWorkspaceBreadcrumbs'
import { useLocation } from '@tanstack/react-router'

export function WorkspaceHeader() {
  const { state, actions } = useWorkspaceContext()
  const location = useLocation()
  const isFavoritesMode = location.pathname.startsWith(
    '/app/workspace/favorites'
  )
  const isNoteEditPage = location.pathname.includes('/notes/')
  const breadcrumbItems = useWorkspaceBreadcrumbs({
    selectedCollectionId: state.selectedCollectionId,
    selectedNoteId: state.selectedNoteId,
    mode: isFavoritesMode ? 'favorites' : 'default',
  })

  return (
    <header className="border-b bg-card p-2 sm:p-4">
      <div className="flex w-full items-center justify-between gap-2 sm:gap-4">
        {/* Bouton hamburger */}
        <Button
          variant="ghost"
          size="icon"
          onClick={actions.toggleSidebar}
          aria-label="Toggle sidebar"
          className="shrink-0"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="min-w-0 flex-1">
          <WorkspaceBreadcrumb items={breadcrumbItems} />
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {!isNoteEditPage && (
            <WorkspaceSearch
              value={state.search}
              onChange={actions.setSearch}
            />
          )}
          {!state.selectedNoteId && (
            <WorkspaceViewToggle view={state.view} onChange={actions.setView} />
          )}
          <WorkspaceGraphButton onClick={actions.openGraphView} />
        </div>
      </div>
    </header>
  )
}
