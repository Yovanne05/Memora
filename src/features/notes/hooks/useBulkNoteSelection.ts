import { useState, useCallback } from "react"

export function useBulkNoteSelection() {
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(new Set())

  const toggleSelection = useCallback((noteId: string) => {
    setSelectedNoteIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(noteId)) {
        newSet.delete(noteId)
      } else {
        newSet.add(noteId)
      }
      return newSet
    })
  }, [])

  const selectAll = useCallback((noteIds: string[]) => {
    setSelectedNoteIds(new Set(noteIds))
  }, [])

  const deselectAll = useCallback(() => {
    setSelectedNoteIds(new Set())
  }, [])

  const isSelected = useCallback((noteId: string) => {
    return selectedNoteIds.has(noteId)
  }, [selectedNoteIds])

  const hasSelection = selectedNoteIds.size > 0

  return {
    selectedNoteIds: Array.from(selectedNoteIds),
    selectedCount: selectedNoteIds.size,
    toggleSelection,
    selectAll,
    deselectAll,
    isSelected,
    hasSelection
  }
}
