import { calculateNodeConnections, getNodeConnectionCount } from "@/features/visualization/lib/nodeConnections"
import { useNodeConnections } from "@/features/visualization/hooks/useNodeConnections"
import { renderHook } from "@testing-library/react"

const sampleData = {
  collectionId: "c1",
  nodes: [
    { id: "n1", title: "Note 1" },
    { id: "n2", title: "Note 2" },
    { id: "n3", title: "Note 3" },
  ],
  edges: [
    { sourceId: "n1", targetId: "n2" },
    { sourceId: "n2", targetId: "n3" },
  ],
}

describe("nodeConnections utilities", () => {
  test("calculateNodeConnections compte les connexions entrantes et sortantes", () => {
    const result = calculateNodeConnections(sampleData)
    expect(result).toEqual({
      n1: 1,
      n2: 2,
      n3: 1,
    })
  })

  test("getNodeConnectionCount renvoie 0 pour un nœud inconnu", () => {
    const connections = calculateNodeConnections(sampleData)
    expect(getNodeConnectionCount("unknown", connections)).toBe(0)
  })
})

describe("useNodeConnections", () => {
  test("renvoie une map vide sans données", () => {
    const { result } = renderHook(() => useNodeConnections())
    expect(result.current).toEqual({})
  })

  test("calcule les connexions à partir des données", () => {
    const { result } = renderHook(() => useNodeConnections(sampleData))
    expect(result.current.n2).toBe(2)
  })
})
