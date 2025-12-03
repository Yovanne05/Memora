import { useState, useCallback } from "react"

interface UseSidebarStateReturn {
  isCollapsed: boolean
  toggle: () => void
  collapse: () => void
  expand: () => void
}

export function useSidebarState(
  initialCollapsed = false
): UseSidebarStateReturn {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed)

  const toggle = useCallback(() => {
    setIsCollapsed((prev) => !prev)
  }, [])

  const collapse = useCallback(() => {
    setIsCollapsed(true)
  }, [])

  const expand = useCallback(() => {
    setIsCollapsed(false)
  }, [])

  return {
    isCollapsed,
    toggle,
    collapse,
    expand,
  }
}
