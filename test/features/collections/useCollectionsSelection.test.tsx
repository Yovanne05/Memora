import { renderHook, act } from "@testing-library/react"
import { useCollectionsSelection } from "@/features/collections/hooks/useCollectionsSelection"

describe("useCollectionsSelection", () => {
  test("l'état initial est vide", () => {
    const { result } = renderHook(() => useCollectionsSelection())

    expect(result.current.selectedIds).toEqual([])
    expect(result.current.selectedCount).toBe(0)
    expect(result.current.selectionMode).toBe(false)
  })

  test("toggleSelection ajoute et retire des IDs", () => {
    const { result } = renderHook(() => useCollectionsSelection())

    act(() => {
      result.current.toggleSelection("col-1")
    })

    expect(result.current.selectedIds).toEqual(["col-1"])
    expect(result.current.selectedCount).toBe(1)

    act(() => {
      result.current.toggleSelection("col-2")
    })

    expect(result.current.selectedIds).toEqual(["col-1", "col-2"])
    expect(result.current.selectedCount).toBe(2)

    act(() => {
      result.current.toggleSelection("col-1")
    })

    expect(result.current.selectedIds).toEqual(["col-2"])
    expect(result.current.selectedCount).toBe(1)
  })

  test("selectAll sélectionne tous les IDs", () => {
    const { result } = renderHook(() => useCollectionsSelection())

    act(() => {
      result.current.selectAll(["col-1", "col-2", "col-3"])
    })

    expect(result.current.selectedIds).toEqual(["col-1", "col-2", "col-3"])
    expect(result.current.selectedCount).toBe(3)
  })

  test("clearSelection vide la sélection", () => {
    const { result } = renderHook(() => useCollectionsSelection())

    act(() => {
      result.current.selectAll(["col-1", "col-2"])
    })

    expect(result.current.selectedCount).toBe(2)

    act(() => {
      result.current.clearSelection()
    })

    expect(result.current.selectedIds).toEqual([])
    expect(result.current.selectedCount).toBe(0)
  })

  test("isSelected vérifie si un ID est sélectionné", () => {
    const { result } = renderHook(() => useCollectionsSelection())

    act(() => {
      result.current.toggleSelection("col-1")
    })

    expect(result.current.isSelected("col-1")).toBe(true)
    expect(result.current.isSelected("col-2")).toBe(false)
  })

  test("toggleSelectionMode bascule le mode et vide la sélection", () => {
    const { result } = renderHook(() => useCollectionsSelection())

    act(() => {
      result.current.selectAll(["col-1", "col-2"])
    })

    act(() => {
      result.current.toggleSelectionMode()
    })

    expect(result.current.selectionMode).toBe(true)

    act(() => {
      result.current.toggleSelectionMode()
    })

    expect(result.current.selectionMode).toBe(false)
    expect(result.current.selectedIds).toEqual([])
  })

  test("exitSelectionMode désactive le mode et vide la sélection", () => {
    const { result } = renderHook(() => useCollectionsSelection())

    act(() => {
      result.current.toggleSelectionMode()
      result.current.selectAll(["col-1"])
    })

    expect(result.current.selectionMode).toBe(true)
    expect(result.current.selectedCount).toBe(1)

    act(() => {
      result.current.exitSelectionMode()
    })

    expect(result.current.selectionMode).toBe(false)
    expect(result.current.selectedIds).toEqual([])
  })
})
