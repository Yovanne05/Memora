import { useWorkspaceContext } from "../context/WorkspaceContext"
import { WorkspaceBreadcrumb } from "./workspace-header/WorkspaceBreadcrumb"
import { WorkspaceGraphButton } from "./workspace-header/WorkspaceGraphButton"
import { WorkspaceSearch } from "./workspace-header/WorkspaceSearch"
import { WorkspaceViewToggle } from "./workspace-header/WorkspaceViewToggle"
import { useWorkspaceBreadcrumbs } from "./workspace-header/useWorkspaceBreadcrumbs"

export function WorkspaceHeader() {
  const { state, actions } = useWorkspaceContext()
  const breadcrumbItems = useWorkspaceBreadcrumbs({
    selectedCollectionId: state.selectedCollectionId,
    selectedNoteId: state.selectedNoteId,
  })

  return (
    <header className="border-b bg-card p-4">
      <div className="flex items-center justify-between gap-4">
        <WorkspaceBreadcrumb items={breadcrumbItems} />
        <div className="flex items-center gap-2">
          <WorkspaceSearch value={state.search} onChange={actions.setSearch} />
          {!state.selectedNoteId && (
            <WorkspaceViewToggle view={state.view} onChange={actions.setView} />
          )}
          <WorkspaceGraphButton onClick={actions.openGraphView} />
        </div>
      </div>
    </header>
  )
}
