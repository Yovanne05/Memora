import { renderHook, act } from "@testing-library/react"
import { useResizable } from "@/hooks/useResizable"
import { vi } from "vitest"

describe("useResizable", () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1920,
    })
  })

  test("utilise defaultWidth initial", () => {
    const { result } = renderHook(() => useResizable({ defaultWidth: 500 }))

    expect(result.current.width).toBe(500)
    expect(result.current.isResizing).toBe(false)
  })

  test("charge la largeur depuis localStorage", () => {
    localStorage.setItem("resizable-width", "600")

    const { result } = renderHook(() => useResizable())

    expect(result.current.width).toBe(600)
  })

  test("utilise storageKey personnalisé", () => {
    localStorage.setItem("custom-key", "700")

    const { result } = renderHook(() => useResizable({ storageKey: "custom-key" }))

    expect(result.current.width).toBe(700)
  })

  test("handleMouseDown active isResizing", () => {
    const { result } = renderHook(() => useResizable())

    expect(result.current.isResizing).toBe(false)

    act(() => {
      result.current.handleMouseDown()
    })

    expect(result.current.isResizing).toBe(true)
  })

  test("respecte minWidth et maxWidth", () => {
    const { result } = renderHook(() =>
      useResizable({
        minWidth: 300,
        maxWidth: 800,
        defaultWidth: 500,
      })
    )

    expect(result.current.width).toBe(500)
    expect(result.current.width).toBeGreaterThanOrEqual(300)
    expect(result.current.width).toBeLessThanOrEqual(800)
  })

  test("resizeRef est défini", () => {
    const { result } = renderHook(() => useResizable())

    expect(result.current.resizeRef).toBeDefined()
    expect(result.current.resizeRef.current).toBeNull()
  })
})
