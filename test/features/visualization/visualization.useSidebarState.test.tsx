import { renderHook, act } from "@testing-library/react"
import { useSidebarState } from "@/features/visualization/hooks/useSidebarState"

describe("useSidebarState", () => {
  test("toggle, collapse et expand modifient correctement l'état", () => {
    const { result } = renderHook(() => useSidebarState())

    act(() => result.current.toggle())
    expect(result.current.isCollapsed).toBe(true)

    act(() => result.current.expand())
    expect(result.current.isCollapsed).toBe(false)

    act(() => result.current.collapse())
    expect(result.current.isCollapsed).toBe(true)
  })

  test("initialCollapsed positionne l'état initial", () => {
    const { result } = renderHook(() => useSidebarState(true))
    expect(result.current.isCollapsed).toBe(true)
  })
})
