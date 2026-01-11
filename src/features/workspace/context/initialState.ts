import type { WorkspaceState } from '../types/workspace.types'

export const INITIAL_STATE: WorkspaceState = {
  selectedNoteId: null,
  selectedCollectionId: null,
  mode: 'notes',
  view: 'grid',
  sidebarExpanded: new Set<string>(),
  sidebarOpen: false,
  search: '',
  sort: 'recent',
  page: 0,
  limit: 12,
  createNoteDialogOpen: false,
  createCollectionDialogOpen: false,
  graphViewOpen: false,
}

export const STORAGE_KEYS = {
  EXPANDED_COLLECTIONS: 'workspace:expanded-collections',
  VIEW: 'workspace:view',
} as const
