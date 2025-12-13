import { renderHook } from "@testing-library/react"
import { useNodePositions } from "@/features/visualization/hooks/useNodePositions"
import type { CollectionVisualization } from "@/features/visualization/types/visualization.type"

const mockCalculateLayeredLayout = vi.hoisted(() =>
  vi.fn().mockReturnValue({
    positions: { n1: { x: 0, y: 0 } },
    orphanNodes: new Set<string>(["orphan"]),
  })
)
const mockRefineLayeredPositions = vi.hoisted(() => vi.fn().mockReturnValue({ n1: { x: 1, y: 2 } }))
const mockCalculateForceDirectedLayout = vi.hoisted(() => vi.fn().mockReturnValue({ n1: { x: 3, y: 4 } }))
const mockShouldApplyForceLayout = vi.hoisted(() => vi.fn())
const mockCalculateCanvasDimensions = vi.hoisted(() => vi.fn().mockReturnValue({ width: 100, height: 80 }))

vi.mock("@/features/visualization/lib/layoutEngine", () => ({
  calculateLayeredLayout: mockCalculateLayeredLayout,
  refineLayeredPositions: mockRefineLayeredPositions,
  calculateForceDirectedLayout: mockCalculateForceDirectedLayout,
}))

vi.mock("@/features/visualization/lib/layoutStrategy", () => ({
  shouldApplyForceLayout: mockShouldApplyForceLayout,
  calculateCanvasDimensions: mockCalculateCanvasDimensions,
}))

const data: CollectionVisualization = {
  collectionId: "c1",
  nodes: [
    { id: "n1", title: "Node 1" },
    { id: "orphan", title: "Orphan" },
  ],
  edges: [{ sourceId: "n1", targetId: "n1" }],
}

describe("useNodePositions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCalculateLayeredLayout.mockReturnValue({
      positions: { n1: { x: 0, y: 0 } },
      orphanNodes: new Set<string>(["orphan"]),
    })
    mockRefineLayeredPositions.mockReturnValue({ n1: { x: 1, y: 2 } })
    mockCalculateForceDirectedLayout.mockReturnValue({ n1: { x: 3, y: 4 } })
    mockShouldApplyForceLayout.mockReturnValue(false)
  })

  test("retourne des positions raffinées sans force layout", () => {
    const { result } = renderHook(() => useNodePositions(data))
    expect(result.current.positions).toEqual({ n1: { x: 1, y: 2 } })
    expect(result.current.orphanNodeIds.has("orphan")).toBe(true)
    expect(mockCalculateForceDirectedLayout).not.toHaveBeenCalled()
  })

  test("applique le force layout lorsque nécessaire", () => {
    mockShouldApplyForceLayout.mockReturnValue(true)
    const { result } = renderHook(() => useNodePositions(data))
    expect(result.current.positions).toEqual({ n1: { x: 3, y: 4 } })
    expect(mockCalculateCanvasDimensions).toHaveBeenCalledWith(1)
  })

  test("retourne des positions vides sans data", () => {
    const { result } = renderHook(() => useNodePositions(undefined))
    expect(result.current.positions).toEqual({})
    expect(result.current.orphanNodeIds.size).toBe(0)
  })
})
