import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  type ReactNode,
  useEffect,
} from "react"
import type {
  WorkspaceState,
  WorkspaceActions,
  WorkspaceView,
  NotesSort,
  WorkspaceMode,
} from "../types/workspace.types"

interface WorkspaceContextValue {
  state: WorkspaceState
  actions: WorkspaceActions
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

// Actions
type WorkspaceAction =
  | { type: "SELECT_NOTE"; payload: string | null }
  | { type: "SELECT_COLLECTION"; payload: string | null }
  | { type: "TOGGLE_COLLECTION"; payload: string }
  | { type: "EXPAND_COLLECTION"; payload: string }
  | { type: "COLLAPSE_COLLECTION"; payload: string }
  | { type: "SET_VIEW"; payload: WorkspaceView }
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_MODE"; payload: WorkspaceMode }
  | { type: "SET_SORT"; payload: NotesSort }
  | { type: "SET_PAGE"; payload: number }
  | { type: "OPEN_CREATE_NOTE" }
  | { type: "CLOSE_CREATE_NOTE" }
  | { type: "OPEN_CREATE_COLLECTION" }
  | { type: "CLOSE_CREATE_COLLECTION" }
  | { type: "OPEN_GRAPH_VIEW" }
  | { type: "CLOSE_GRAPH_VIEW" }
  | { type: "LOAD_EXPANDED_FROM_STORAGE"; payload: Set<string> }

// Initial state
const INITIAL_STATE: WorkspaceState = {
  selectedNoteId: null,
  selectedCollectionId: null,
  mode : "notes",
  view: "grid",
  sidebarExpanded: new Set<string>(),
  search: "",
  sort: "recent",
  page: 0,
  limit: 12,
  createNoteDialogOpen: false,
  createCollectionDialogOpen: false,
  graphViewOpen: false,
}

// LocalStorage keys
const STORAGE_KEYS = {
  EXPANDED_COLLECTIONS: "workspace:expanded-collections",
  VIEW: "workspace:view",
} as const

// Reducer
function workspaceReducer(
  state: WorkspaceState,
  action: WorkspaceAction
): WorkspaceState {
  switch (action.type) {
    case "SELECT_NOTE":
      return { ...state, selectedNoteId: action.payload }

    case "SELECT_COLLECTION":
      return { ...state, selectedCollectionId: action.payload, page: 0 }

    case "TOGGLE_COLLECTION": {
      const newExpanded = new Set(state.sidebarExpanded)
      if (newExpanded.has(action.payload)) {
        newExpanded.delete(action.payload)
      } else {
        newExpanded.add(action.payload)
      }
      return { ...state, sidebarExpanded: newExpanded }
    }

    case "EXPAND_COLLECTION": {
      const newExpanded = new Set(state.sidebarExpanded)
      newExpanded.add(action.payload)
      return { ...state, sidebarExpanded: newExpanded }
    }

    case "COLLAPSE_COLLECTION": {
      const newExpanded = new Set(state.sidebarExpanded)
      newExpanded.delete(action.payload)
      return { ...state, sidebarExpanded: newExpanded }
    }

    case "SET_VIEW":
      return { ...state, view: action.payload }

    case "SET_MODE":
      return {
        ...state,
        mode: action.payload,
        selectedCollectionId: null,
        selectedNoteId: null,
        page: 0,
      }

    case "SET_SEARCH":
      return { ...state, search: action.payload, page: 0 }

    case "SET_SORT":
      return { ...state, sort: action.payload, page: 0 }

    case "SET_PAGE":
      return { ...state, page: action.payload }

    case "OPEN_CREATE_NOTE":
      return { ...state, createNoteDialogOpen: true }

    case "CLOSE_CREATE_NOTE":
      return { ...state, createNoteDialogOpen: false }

    case "OPEN_CREATE_COLLECTION":
      return { ...state, createCollectionDialogOpen: true }

    case "CLOSE_CREATE_COLLECTION":
      return { ...state, createCollectionDialogOpen: false }

    case "OPEN_GRAPH_VIEW":
      return { ...state, graphViewOpen: true }

    case "CLOSE_GRAPH_VIEW":
      return { ...state, graphViewOpen: false }

    case "LOAD_EXPANDED_FROM_STORAGE":
      return { ...state, sidebarExpanded: action.payload }

    default:
      return state
  }
}

// Provider
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workspaceReducer, INITIAL_STATE, (initial): WorkspaceState => {
    // Initialize view from localStorage
    const savedView = localStorage.getItem(STORAGE_KEYS.VIEW)
    if (savedView === "grid" || savedView === "list") {
      return { ...initial, view: savedView as WorkspaceView }
    }
    return initial
  })

  // Load expanded collections from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXPANDED_COLLECTIONS)
      if (saved) {
        const expandedArray = JSON.parse(saved) as string[]
        dispatch({
          type: "LOAD_EXPANDED_FROM_STORAGE",
          payload: new Set(expandedArray),
        })
      }
    } catch (error) {
      console.error("Failed to load expanded collections from storage:", error)
    }
  }, [])

  // Persist expanded collections to localStorage
  useEffect(() => {
    try {
      const expandedArray = Array.from(state.sidebarExpanded)
      localStorage.setItem(
        STORAGE_KEYS.EXPANDED_COLLECTIONS,
        JSON.stringify(expandedArray)
      )
    } catch (error) {
      console.error("Failed to save expanded collections to storage:", error)
    }
  }, [state.sidebarExpanded])

  // Persist view to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VIEW, state.view)
    } catch (error) {
      console.error("Failed to save view to storage:", error)
    }
  }, [state.view])

  // Actions
  const actions: WorkspaceActions = useMemo(
    () => ({
      selectNote: (id: string | null) => {
        dispatch({ type: "SELECT_NOTE", payload: id })
      },

      selectCollection: (id: string | null) => {
        dispatch({ type: "SELECT_COLLECTION", payload: id })
      },

      toggleCollection: (id: string) => {
        dispatch({ type: "TOGGLE_COLLECTION", payload: id })
      },

      expandCollection: (id: string) => {
        dispatch({ type: "EXPAND_COLLECTION", payload: id })
      },

      collapseCollection: (id: string) => {
        dispatch({ type: "COLLAPSE_COLLECTION", payload: id })
      },

      setView: (view: WorkspaceView) => {
        dispatch({ type: "SET_VIEW", payload: view })
      },

      setMode: (mode: WorkspaceMode) => {
        dispatch({ type: "SET_MODE", payload: mode })
      },
      
      setSearch: (search: string) => {
        dispatch({ type: "SET_SEARCH", payload: search })
      },

      setSort: (sort: NotesSort) => {
        dispatch({ type: "SET_SORT", payload: sort })
      },

      setPage: (page: number) => {
        dispatch({ type: "SET_PAGE", payload: page })
      },

      openCreateNote: () => {
        dispatch({ type: "OPEN_CREATE_NOTE" })
      },

      closeCreateNote: () => {
        dispatch({ type: "CLOSE_CREATE_NOTE" })
      },

      openCreateCollection: () => {
        dispatch({ type: "OPEN_CREATE_COLLECTION" })
      },

      closeCreateCollection: () => {
        dispatch({ type: "CLOSE_CREATE_COLLECTION" })
      },

      openGraphView: () => {
        dispatch({ type: "OPEN_GRAPH_VIEW" })
      },

      closeGraphView: () => {
        dispatch({ type: "CLOSE_GRAPH_VIEW" })
      },
    }),
    [dispatch]
  )

  return (
    <WorkspaceContext.Provider value={{ state, actions }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

// Hook
export function useWorkspaceContext() {
  const context = useContext(WorkspaceContext)
  if (!context) {
    throw new Error("useWorkspaceContext must be used within WorkspaceProvider")
  }
  return context
}
