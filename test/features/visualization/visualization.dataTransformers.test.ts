import { transformNodesToReactFlow, filterValidEdges, extractNodePositions, transformEdgesToReactFlow, getNodeColorForMiniMap } from "@/features/visualization/lib/dataTransformers"
import type { CollectionVisualization, VisualizationEdge, ReactFlowNode } from "@/features/visualization/types/visualization.type"
import { REACT_FLOW_STYLES } from "@/features/visualization/lib/visualization.constants"

vi.mock("@/features/visualization/lib/layoutEngine", () => ({
  groupEdgesByConnection: (edges: VisualizationEdge[], _positions: Record<string, { x: number; y: number }>) => {
    // simple grouping: one group per unique pair
    return edges.map((edge, index) => ({
      sourceId: edge.sourceId,
      targetId: edge.targetId,
      sourceSide: "right" as const,
      targetSide: "left" as const,
      edgeIndices: [index],
    }))
  },
  calculateEdgeOffset: (localIndex: number) => localIndex * 10,
}))

const sampleData: CollectionVisualization = {
  collectionId: "c1",
  nodes: [
    { id: "n1", title: "A" },
    { id: "n2", title: "B" },
  ],
  edges: [{ sourceId: "n1", targetId: "n2" }],
}

describe("dataTransformers", () => {
  test("transformNodesToReactFlow applique la position par défaut et le nombre de connexions", () => {
    const nodes = transformNodesToReactFlow(sampleData, { n1: { x: 5, y: 10 } }, { n1: 2, n2: 1 })
    expect(nodes).toEqual([
      {
        id: "n1",
        type: "custom",
        position: { x: 5, y: 10 },
        data: { title: "A", connections: 2 },
      },
      {
        id: "n2",
        type: "custom",
        position: { x: 0, y: 0 },
        data: { title: "B", connections: 1 },
      },
    ])
  })

  test("filterValidEdges ignore les arêtes invalides et prévient", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
    const valid = new Set(["n1"])
    const edges = [
      { sourceId: "n1", targetId: "nX" },
      { sourceId: "n1", targetId: "n1" },
    ]

    const result = filterValidEdges(edges, valid)
    expect(result).toHaveLength(1)
    expect(warnSpy).toHaveBeenCalled()
    warnSpy.mockRestore()
  })

  test("extractNodePositions construit une map id → position", () => {
    const nodes: ReactFlowNode[] = [
      { id: "a", position: { x: 1, y: 2 } } as ReactFlowNode,
      { id: "b", position: { x: 3, y: 4 } } as ReactFlowNode,
    ]
    expect(extractNodePositions(nodes)).toEqual({
      a: { x: 1, y: 2 },
      b: { x: 3, y: 4 },
    })
  })

  test("transformEdgesToReactFlow crée des arêtes ReactFlow avec styles", () => {
    const positions = { n1: { x: 0, y: 0 }, n2: { x: 10, y: 0 } }
    const edges = transformEdgesToReactFlow(sampleData.edges, positions)

    expect(edges[0]).toMatchObject({
      id: "en1-n2",
      source: "n1",
      target: "n2",
      sourceHandle: "right-source",
      targetHandle: "left-target",
      style: {
        stroke: REACT_FLOW_STYLES.EDGE_COLOR,
        strokeWidth: REACT_FLOW_STYLES.EDGE_WIDTH,
      },
      data: {
        pathOptions: expect.objectContaining({ offset: 0 }),
      },
    })
  })

  test("getNodeColorForMiniMap utilise les connexions pour déterminer la couleur", () => {
    const node = {
      id: "n1",
      data: { connections: 3 },
    } as ReactFlowNode

    const color = getNodeColorForMiniMap(node, (count) => (count > 2 ? "#111" : "#fff"))
    expect(color).toBe("#111")
  })
})
