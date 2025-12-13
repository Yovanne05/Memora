import { renderHook } from "@testing-library/react"
import { useVisualizationLayout } from "@/features/visualization/hooks/useVisualizationLayout"
import type { Collection } from "@/features/collections/models/collection.model"

const mockUseNodeConnections = vi.hoisted(() => vi.fn())
const mockUseNodePositions = vi.hoisted(() => vi.fn())
const mockUseReactFlowNodes = vi.hoisted(() => vi.fn())
const mockUseReactFlowEdges = vi.hoisted(() => vi.fn())

vi.mock("@/features/visualization/hooks/useNodeConnections", () => ({
  useNodeConnections: mockUseNodeConnections,
}))
vi.mock("@/features/visualization/hooks/useNodePositions", () => ({
  useNodePositions: mockUseNodePositions,
}))
vi.mock("@/features/visualization/hooks/useReactFlowNodes", () => ({
  useReactFlowNodes: mockUseReactFlowNodes,
}))
vi.mock("@/features/visualization/hooks/useReactFlowEdges", () => ({
  useReactFlowEdges: mockUseReactFlowEdges,
}))

const data: Collection = {
  id: "c1",
  ownerId: "owner",
  name: "Collection",
  description: null,
  visibility: "private",
  tags: [],
  notes: [],
  nodes: [
    {
      id: "n1",
      data: {
        label: "A",
        note_id: "n1",
        title: "A",
        tags: [],
      },
    },
  ],
  edges: [],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-02T00:00:00.000Z",
}


describe("useVisualizationLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseNodeConnections.mockReturnValue({ n1: 1 })
    mockUseNodePositions.mockReturnValue({ positions: { n1: { x: 1, y: 2 } }, orphanNodeIds: new Set() })
    mockUseReactFlowNodes.mockReturnValue([{ id: "n1" }])
    mockUseReactFlowEdges.mockReturnValue([{ id: "e1" }])
  })

  test("compose les sous-hooks pour retourner nodes, edges et connexions", () => {
    const { result } = renderHook(() => useVisualizationLayout(data))

    expect(mockUseNodeConnections).toHaveBeenCalledWith(data)
    expect(mockUseNodePositions).toHaveBeenCalledWith(data)
    expect(mockUseReactFlowNodes).toHaveBeenCalledWith(
      data,
      { n1: { x: 1, y: 2 } },
      { n1: 1 },
      new Set()
    )
    expect(mockUseReactFlowEdges).toHaveBeenCalledWith(data, [{ id: "n1" }])

    expect(result.current.nodes).toEqual([{ id: "n1" }])
    expect(result.current.edges).toEqual([{ id: "e1" }])
    expect(result.current.nodeConnections).toEqual({ n1: 1 })
    expect(result.current.orphanNodeIds.size).toBe(0)
  })

  test("retourne des valeurs par défaut si data absente", () => {
    mockUseNodeConnections.mockReturnValue({})
    mockUseNodePositions.mockReturnValue({ positions: {}, orphanNodeIds: new Set(["a"]) })
    mockUseReactFlowNodes.mockReturnValue([])
    mockUseReactFlowEdges.mockReturnValue([])

    const { result } = renderHook(() => useVisualizationLayout(undefined))
    expect(result.current.nodes).toEqual([])
    expect(result.current.edges).toEqual([])
    expect(result.current.nodeConnections).toEqual({})
    expect(result.current.orphanNodeIds.has("a")).toBe(true)
  })
})
