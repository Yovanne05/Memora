export type WorkspaceView = "grid" | "list"

export type NotesSort = "recent" | "oldest" | "title-asc" | "title-desc"

export interface WorkspaceState {
  // Navigation
  selectedNoteId: string | null
  selectedCollectionId: string | null

  // UI State
  view: WorkspaceView
  sidebarExpanded: Set<string> // IDs des collections dépliées

  // Filters
  search: string
  sort: NotesSort
  page: number
  limit: number

  // Dialogs
  createNoteDialogOpen: boolean
  createCollectionDialogOpen: boolean
  graphViewOpen: boolean
}

export interface WorkspaceActions {
  // Navigation
  selectNote: (id: string | null) => void
  selectCollection: (id: string | null) => void

  // Sidebar
  toggleCollection: (id: string) => void
  expandCollection: (id: string) => void
  collapseCollection: (id: string) => void

  // UI
  setView: (view: WorkspaceView) => void
  setSearch: (search: string) => void
  setSort: (sort: NotesSort) => void
  setPage: (page: number) => void

  // Dialogs
  openCreateNote: () => void
  closeCreateNote: () => void
  openCreateCollection: () => void
  closeCreateCollection: () => void
  openGraphView: () => void
  closeGraphView: () => void
}
