import { renderHook, act } from "@testing-library/react"
import { useNoteSidebar } from "@/features/visualization/hooks/useNoteSidebar"

describe("useNoteSidebar", () => {
  test("ouvre avec une note et ferme en réinitialisant", () => {
    const { result } = renderHook(() => useNoteSidebar())

    act(() => result.current.openWithNote("note-1"))
    expect(result.current.isOpen).toBe(true)
    expect(result.current.activeNoteId).toBe("note-1")

    act(() => result.current.close())
    expect(result.current.isOpen).toBe(false)
    expect(result.current.activeNoteId).toBeNull()
  })
})
