import { renderHook, act } from "@testing-library/react"
import { useNodeSelection } from "@/features/visualization/hooks/useNodeSelection"
import type { ReactFlowEdge, ReactFlowNode } from "@/features/visualization/types/visualization.type"

const nodes: ReactFlowNode[] = [
  { id: "a", position: { x: 0, y: 0 } } as ReactFlowNode,
  { id: "b", position: { x: 0, y: 0 } } as ReactFlowNode,
]

const edges: ReactFlowEdge[] = [
  { id: "e1", source: "a", target: "b" } as ReactFlowEdge,
]

describe("useNodeSelection", () => {
  test("sélectionne, désélectionne et applique les styles", () => {
    const { result } = renderHook(() => useNodeSelection(nodes, edges))

    act(() => result.current.selectNode("a"))
    expect(result.current.selectedNodeId).toBe("a")
    expect(result.current.styledEdges[0].style?.opacity).toBe(1)

    act(() => result.current.selectNode("a"))
    expect(result.current.selectedNodeId).toBeNull()
    expect(result.current.styledNodes.every((n) => n.style?.opacity === undefined || n.style?.opacity === 1)).toBe(true)
  })

  test("clearSelection réinitialise la sélection", () => {
    const { result } = renderHook(() => useNodeSelection(nodes, edges))

    act(() => result.current.selectNode("a"))
    act(() => result.current.clearSelection())
    expect(result.current.selectedNodeId).toBeNull()
  })
})
