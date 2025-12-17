import { useCallback, useState } from "react"

export function useCollectionsSelection() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectionMode, setSelectionMode] = useState(false)

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids))
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  )

  const toggleSelectionMode = useCallback(() => {
    setSelectionMode((prev) => !prev)
    if (selectionMode) {
      setSelectedIds(new Set())
    }
  }, [selectionMode])

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false)
    setSelectedIds(new Set())
  }, [])

  return {
    selectedIds: Array.from(selectedIds),
    selectedCount: selectedIds.size,
    selectionMode,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    toggleSelectionMode,
    exitSelectionMode,
  }
}
