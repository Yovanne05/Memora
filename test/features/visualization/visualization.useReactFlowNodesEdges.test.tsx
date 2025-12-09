import { renderHook } from "@testing-library/react"
import { useReactFlowNodes } from "@/features/visualization/hooks/useReactFlowNodes"
import { useReactFlowEdges } from "@/features/visualization/hooks/useReactFlowEdges"
import type { CollectionVisualization, ReactFlowNode } from "@/features/visualization/types/visualization.type"

const mockTransformNodesToReactFlow = vi.hoisted(() => vi.fn())
const mockExtractNodePositions = vi.hoisted(() => vi.fn())
const mockFilterValidEdges = vi.hoisted(() => vi.fn())
const mockTransformEdgesToReactFlow = vi.hoisted(() => vi.fn())

vi.mock("@/features/visualization/lib/dataTransformers", () => ({
  transformNodesToReactFlow: mockTransformNodesToReactFlow,
  extractNodePositions: mockExtractNodePositions,
  filterValidEdges: mockFilterValidEdges,
  transformEdgesToReactFlow: mockTransformEdgesToReactFlow,
}))

const data: CollectionVisualization = {
  collectionId: "c1",
  nodes: [
    { id: "keep", title: "Keep" },
    { id: "orphan", title: "Orphan" },
  ],
  edges: [
    { sourceId: "keep", targetId: "orphan" },
  ],
}

describe("useReactFlowNodes", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockTransformNodesToReactFlow.mockReturnValue([{ id: "keep" }])
  })

  test("retourne un tableau vide sans data", () => {
    const { result } = renderHook(() => useReactFlowNodes(undefined, {}, {}, new Set()))
    expect(result.current).toEqual([])
  })

  test("filtre les orphelins et transforme les nœuds", () => {
    const orphanIds = new Set(["orphan"])
    const positions = { keep: { x: 0, y: 0 } }
    const connections = { keep: 1 }

    const { result } = renderHook(() => useReactFlowNodes(data, positions, connections, orphanIds))
    expect(mockTransformNodesToReactFlow).toHaveBeenCalledWith(
      { ...data, nodes: [{ id: "keep", title: "Keep" }] },
      positions,
      connections
    )
    expect(result.current).toEqual([{ id: "keep" }])
  })
})

describe("useReactFlowEdges", () => {
  const nodes: ReactFlowNode[] = [
    { id: "keep", position: { x: 0, y: 0 } } as ReactFlowNode,
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockExtractNodePositions.mockReturnValue({ keep: { x: 1, y: 2 } })
    mockFilterValidEdges.mockReturnValue([{ sourceId: "keep", targetId: "orphan" }])
    mockTransformEdgesToReactFlow.mockReturnValue([{ id: "edge" }])
  })

  test("retourne vide sans data ou nodes", () => {
    const noData = renderHook(() => useReactFlowEdges(undefined, nodes))
    expect(noData.result.current ?? noData.current).toEqual([])

    const noNodes = renderHook(() => useReactFlowEdges(data, []))
    expect(noNodes.result.current ?? noNodes.current).toEqual([])
  })

  test("transforme les arêtes valides", () => {
    const { result } = renderHook(() => useReactFlowEdges(data, nodes))

    expect(mockExtractNodePositions).toHaveBeenCalledWith(nodes)
    expect(mockFilterValidEdges).toHaveBeenCalled()
    expect(mockTransformEdgesToReactFlow).toHaveBeenCalledWith(
      [{ sourceId: "keep", targetId: "orphan" }],
      { keep: { x: 1, y: 2 } }
    )
    expect(result.current).toEqual([{ id: "edge" }])
  })
})
