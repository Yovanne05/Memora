import type {
  NotesSort,
  WorkspaceMode,
  WorkspaceState,
  WorkspaceView,
} from '../types/workspace.types'

export type WorkspaceAction =
  | { type: 'SELECT_NOTE'; payload: string | null }
  | { type: 'SELECT_COLLECTION'; payload: string | null }
  | { type: 'TOGGLE_COLLECTION'; payload: string }
  | { type: 'EXPAND_COLLECTION'; payload: string }
  | { type: 'COLLAPSE_COLLECTION'; payload: string }
  | { type: 'SET_VIEW'; payload: WorkspaceView }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_MODE'; payload: WorkspaceMode }
  | { type: 'SET_SORT'; payload: NotesSort }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'OPEN_SIDEBAR' }
  | { type: 'CLOSE_SIDEBAR' }
  | { type: 'OPEN_CREATE_NOTE' }
  | { type: 'CLOSE_CREATE_NOTE' }
  | { type: 'OPEN_CREATE_COLLECTION' }
  | { type: 'CLOSE_CREATE_COLLECTION' }
  | { type: 'OPEN_GRAPH_VIEW' }
  | { type: 'CLOSE_GRAPH_VIEW' }
  | { type: 'LOAD_EXPANDED_FROM_STORAGE'; payload: Set<string> }

export function workspaceReducer(
  state: WorkspaceState,
  action: WorkspaceAction
): WorkspaceState {
  switch (action.type) {
    case 'SELECT_NOTE':
      return { ...state, selectedNoteId: action.payload }

    case 'SELECT_COLLECTION':
      return { ...state, selectedCollectionId: action.payload, page: 0 }

    case 'TOGGLE_COLLECTION': {
      const newExpanded = new Set(state.sidebarExpanded)
      if (newExpanded.has(action.payload)) {
        newExpanded.delete(action.payload)
      } else {
        newExpanded.add(action.payload)
      }
      return { ...state, sidebarExpanded: newExpanded }
    }

    case 'EXPAND_COLLECTION': {
      const newExpanded = new Set(state.sidebarExpanded)
      newExpanded.add(action.payload)
      return { ...state, sidebarExpanded: newExpanded }
    }

    case 'COLLAPSE_COLLECTION': {
      const newExpanded = new Set(state.sidebarExpanded)
      newExpanded.delete(action.payload)
      return { ...state, sidebarExpanded: newExpanded }
    }

    case 'SET_VIEW':
      return { ...state, view: action.payload }

    case 'SET_MODE':
      return {
        ...state,
        mode: action.payload,
        selectedCollectionId: null,
        selectedNoteId: null,
        page: 0,
      }

    case 'SET_SEARCH':
      return { ...state, search: action.payload, page: 0 }

    case 'SET_SORT':
      return { ...state, sort: action.payload, page: 0 }

    case 'SET_PAGE':
      return { ...state, page: action.payload }

    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen }

    case 'OPEN_SIDEBAR':
      return { ...state, sidebarOpen: true }

    case 'CLOSE_SIDEBAR':
      return { ...state, sidebarOpen: false }

    case 'OPEN_CREATE_NOTE':
      return { ...state, createNoteDialogOpen: true }

    case 'CLOSE_CREATE_NOTE':
      return { ...state, createNoteDialogOpen: false }

    case 'OPEN_CREATE_COLLECTION':
      return { ...state, createCollectionDialogOpen: true }

    case 'CLOSE_CREATE_COLLECTION':
      return { ...state, createCollectionDialogOpen: false }

    case 'OPEN_GRAPH_VIEW':
      return { ...state, graphViewOpen: true }

    case 'CLOSE_GRAPH_VIEW':
      return { ...state, graphViewOpen: false }

    case 'LOAD_EXPANDED_FROM_STORAGE':
      return { ...state, sidebarExpanded: action.payload }

    default:
      return state
  }
}
