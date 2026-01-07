import { useMemo, useReducer } from "react"

import type { ReactNode } from "react"
import { WorkspaceContext } from "./context"
import { createWorkspaceActions } from "./actions"
import { workspaceReducer } from "./workspaceReducer"
import { getInitialWorkspaceState, workspaceDefaults } from "./storage"
import { useWorkspaceStorage } from "./useWorkspaceStorage"

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    workspaceReducer,
    workspaceDefaults,
    getInitialWorkspaceState
  )

  useWorkspaceStorage(state, dispatch)

  const actions = useMemo(() => createWorkspaceActions(dispatch), [dispatch])

  return (
    <WorkspaceContext.Provider value={{ state, actions }}>
      {children}
    </WorkspaceContext.Provider>
  )
}
