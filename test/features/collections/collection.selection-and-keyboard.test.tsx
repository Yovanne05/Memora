import { renderHook } from "@testing-library/react"
import { act } from "react"
import { vi } from "vitest"
import { useCollectionsSelection } from "@/features/collections/hooks/useCollectionsSelection"
import { useCollectionsKeyboardShortcuts } from "@/features/collections/hooks/useCollectionsKeyboardShortcuts"

describe("useCollectionsSelection", () => {
  test("gere l'ajout et la suppression de selection", () => {
    const { result } = renderHook(() => useCollectionsSelection())

    act(() => result.current.toggleSelection("a"))
    expect(result.current.selectedIds).toContain("a")
    expect(result.current.selectedCount).toBe(1)

    act(() => result.current.toggleSelection("a"))
    expect(result.current.selectedIds).toEqual([])
    expect(result.current.selectedCount).toBe(0)
  })

  test("selectionMode se reinitialise en sortie", () => {
    const { result } = renderHook(() => useCollectionsSelection())

    act(() => result.current.selectAll(["a", "b"]))
    act(() => result.current.toggleSelectionMode())
    expect(result.current.selectionMode).toBe(true)

    act(() => result.current.exitSelectionMode())
    expect(result.current.selectionMode).toBe(false)
    expect(result.current.selectedIds).toEqual([])
  })
})

describe("useCollectionsKeyboardShortcuts", () => {
  test("declenche les callbacks sur les raccourcis", () => {
    const onNewCollection = vi.fn()
    const onToggleFilters = vi.fn()
    const onToggleSelectionMode = vi.fn()
    const onSearch = vi.fn()

    renderHook(() =>
      useCollectionsKeyboardShortcuts({
        onNewCollection,
        onToggleFilters,
        onToggleSelectionMode,
        onSearch,
      })
    )

    const event = new KeyboardEvent("keydown", { key: "n", ctrlKey: true })
    window.dispatchEvent(event)
    expect(onNewCollection).toHaveBeenCalled()

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "f", ctrlKey: true }))
    expect(onSearch).toHaveBeenCalled()

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))
    expect(onToggleFilters).toHaveBeenCalled()

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "S", ctrlKey: true, shiftKey: true }))
    expect(onToggleSelectionMode).toHaveBeenCalled()
  })

  test("ignore les inputs et le mode desactive", () => {
    const onNewCollection = vi.fn()

    const { rerender } = renderHook(
      (props: { disabled: boolean }) =>
        useCollectionsKeyboardShortcuts({
          onNewCollection,
          onToggleFilters: () => {},
          onToggleSelectionMode: () => {},
          onSearch: () => {},
          disabled: props.disabled,
        }),
      { initialProps: { disabled: false } }
    )

    const inputEvent = new KeyboardEvent("keydown", {
      key: "n",
      ctrlKey: true,
    })
    Object.defineProperty(inputEvent, "target", {
      value: { tagName: "INPUT" },
    })
    window.dispatchEvent(inputEvent)
    expect(onNewCollection).toHaveBeenCalledTimes(0)

    rerender({ disabled: true })
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "n", ctrlKey: true }))
    expect(onNewCollection).toHaveBeenCalledTimes(0)
  })
})
