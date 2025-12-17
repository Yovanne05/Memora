import { useEffect } from "react"
import { useWorkspaceContext } from "../context/WorkspaceContext"

export function useWorkspaceKeyboardShortcuts() {
  const { actions } = useWorkspaceContext()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger if typing in input/textarea
      const target = e.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Allow Escape to clear search
        if (e.key === "Escape" && target.tagName === "INPUT" && target.getAttribute("type") === "search") {
          e.preventDefault()
          actions.setSearch("")
          target.blur()
        }
        return
      }

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0
      const modifier = isMac ? e.metaKey : e.ctrlKey

      // Ctrl/Cmd + N: New note
      if (modifier && e.key === "n" && !e.shiftKey) {
        e.preventDefault()
        actions.openCreateNote()
      }

      // Ctrl/Cmd + Shift + N: New collection
      if (modifier && e.shiftKey && e.key === "N") {
        e.preventDefault()
        actions.openCreateCollection()
      }

      // Ctrl/Cmd + K: Focus search (or toggle if already focused)
      if (modifier && e.key === "k") {
        e.preventDefault()
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
          searchInput.select()
        }
      }

      // / : Focus search
      if (e.key === "/") {
        e.preventDefault()
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
      }

      // Ctrl/Cmd + G: Open graph view
      if (modifier && e.key === "g") {
        e.preventDefault()
        actions.openGraphView()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [actions])
}
