import { useEffect } from "react"

import type { WorkspaceState } from "../types/workspace.types"
import type { WorkspaceAction } from "./workspaceReducer"
import {
  persistExpandedCollections,
  persistView,
  readExpandedCollections,
} from "./storage"

type Dispatch = (action: WorkspaceAction) => void

export function useWorkspaceStorage(state: WorkspaceState, dispatch: Dispatch) {
  useEffect(() => {
    const expanded = readExpandedCollections()
    if (expanded) {
      dispatch({ type: "LOAD_EXPANDED_FROM_STORAGE", payload: expanded })
    }
  }, [dispatch])

  useEffect(() => {
    persistExpandedCollections(state.sidebarExpanded)
  }, [state.sidebarExpanded])

  useEffect(() => {
    persistView(state.view)
  }, [state.view])
}
