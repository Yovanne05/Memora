import { useEffect } from "react"

interface CollectionsKeyboardShortcutsProps {
  onNewCollection: () => void
  onToggleFilters: () => void
  onToggleSelectionMode: () => void
  onSearch: () => void
  disabled?: boolean
}

export function useCollectionsKeyboardShortcuts({
  onNewCollection,
  onToggleFilters,
  onToggleSelectionMode,
  onSearch,
  disabled = false,
}: CollectionsKeyboardShortcutsProps) {
  useEffect(() => {
    if (disabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignorer si l'utilisateur tape dans un input/textarea
      const target = event.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return
      }

      // Ctrl/Cmd + N : Nouvelle collection
      if ((event.ctrlKey || event.metaKey) && event.key === "n") {
        event.preventDefault()
        onNewCollection()
      }

      // Ctrl/Cmd + F : Focus sur la recherche
      if ((event.ctrlKey || event.metaKey) && event.key === "f") {
        event.preventDefault()
        onSearch()
      }

      // Ctrl/Cmd + K : Toggle filtres
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault()
        onToggleFilters()
      }

      // Ctrl/Cmd + Shift + S : Toggle mode sélection
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === "S") {
        event.preventDefault()
        onToggleSelectionMode()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onNewCollection, onToggleFilters, onToggleSelectionMode, onSearch, disabled])
}
