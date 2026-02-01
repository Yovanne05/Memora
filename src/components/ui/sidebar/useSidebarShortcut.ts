import { useEffect } from "react"

import { SIDEBAR_KEYBOARD_SHORTCUT } from "./constants"

export function useSidebarShortcut(toggleSidebar: () => void) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    globalThis.window.addEventListener("keydown", handleKeyDown)
    return () => globalThis.window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])
}
