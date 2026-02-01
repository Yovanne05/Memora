import { useMemo, useReducer } from "react"
import type { ReactNode } from "react"
import { WorkspaceContext } from "./context"
import { createWorkspaceActions } from "./actions"
import { workspaceReducer } from "./workspaceReducer"
import { getInitialWorkspaceState, workspaceDefaults } from "./storage"
import { useWorkspaceStorage } from "../hooks/useWorkspaceStorage"

interface WorkspaceProviderProps {
  readonly children: ReactNode
}

export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  const [state, dispatch] = useReducer(
    workspaceReducer,
    workspaceDefaults,
    getInitialWorkspaceState
  )

  useWorkspaceStorage(state, dispatch)

  const actions = useMemo(() => createWorkspaceActions(dispatch), [dispatch])

  const value = useMemo(() => ({ state, actions }), [state, actions])

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  )
}
