import { createContext, useContext } from "react"
import type { WorkspaceActions, WorkspaceState } from "../types/workspace.types"

export interface WorkspaceContextValue {
  state: WorkspaceState
  actions: WorkspaceActions
}

export const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function useWorkspaceContext() {
  const context = useContext(WorkspaceContext)
  if (!context) {
    throw new Error("useWorkspaceContext must be used within WorkspaceProvider")
  }
  return context
}

export type { WorkspaceActions, WorkspaceState } from "../types/workspace.types"
