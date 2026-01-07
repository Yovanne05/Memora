import type {
  NotesSort,
  WorkspaceActions,
  WorkspaceMode,
  WorkspaceView,
} from "../types/workspace.types"
import type { WorkspaceAction } from "./workspaceReducer"

type Dispatch = (action: WorkspaceAction) => void

export function createWorkspaceActions(dispatch: Dispatch): WorkspaceActions {
  return {
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
  }
}
