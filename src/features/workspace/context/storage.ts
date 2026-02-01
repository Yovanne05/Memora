import type { WorkspaceState, WorkspaceView } from "../types/workspace.types"
import { INITIAL_STATE, STORAGE_KEYS } from "./initialState"

export function getInitialWorkspaceState(initial: WorkspaceState) {
  const savedView = localStorage.getItem(STORAGE_KEYS.VIEW)
  if (savedView === "grid" || savedView === "list") {
    return { ...initial, view: savedView as WorkspaceView }
  }
  return initial
}

export function readExpandedCollections(): Set<string> | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPANDED_COLLECTIONS)
    if (!saved) return null
    const expandedArray = JSON.parse(saved) as string[]
    return new Set(expandedArray)
  } catch {
    return null
  }
}

export function persistExpandedCollections(expanded: Set<string>) {
  try {
    const expandedArray = Array.from(expanded)
    localStorage.setItem(
      STORAGE_KEYS.EXPANDED_COLLECTIONS,
      JSON.stringify(expandedArray)
    )
  } catch {
    // ignore persistence errors
  }
}

export function persistView(view: WorkspaceView) {
  try {
    localStorage.setItem(STORAGE_KEYS.VIEW, view)
  } catch {
    // ignore persistence errors
  }
}

export const workspaceDefaults = INITIAL_STATE
