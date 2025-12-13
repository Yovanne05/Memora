import { renderHook } from "@testing-library/react"
import { useNodePositions } from "@/features/visualization/hooks/useNodePositions"
import type { Collection } from "@/features/collections/models/collection.model"

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

const data: Collection = {
  id: "c1",
  ownerId: "owner",
  name: "Test Collection",
  description: null,
  visibility: "private",
  tags: [],
  notes: [],
  nodes: [
    {
      id: "n1",
      data: {
        label: "Node 1",
        note_id: "n1",
        title: "Node 1",
        tags: [],
      },
    },
    {
      id: "orphan",
      data: {
        label: "Orphan",
        note_id: "orphan",
        title: "Orphan",
        tags: [],
      },
    },
  ],
  edges: [
    {
      id: "e1",
      source: "n1",
      target: "n1",
    },
  ],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-02T00:00:00.000Z",
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
