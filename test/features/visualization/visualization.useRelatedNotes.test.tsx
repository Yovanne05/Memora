import { renderHook } from "@testing-library/react"
import { useRelatedNotes } from "@/features/visualization/hooks/useRelatedNotes"
import type { CollectionVisualization } from "@/features/visualization/types/visualization.type"

const data: CollectionVisualization = {
  collectionId: "c1",
  nodes: [
    { id: "n1", title: "N1" },
    { id: "n2", title: "N2" },
    { id: "n3", title: "N3" },
  ],
  edges: [
    { sourceId: "n1", targetId: "n2" },
    { sourceId: "n3", targetId: "n1" },
  ],
}

describe("useRelatedNotes", () => {
  test("retourne une liste vide sans note active ou data", () => {
    const noData = renderHook(() => useRelatedNotes("n1", undefined))
    expect(noData.result?.current ?? noData.current).toEqual([])

    const noActive = renderHook(() => useRelatedNotes(null, data))
    expect(noActive.result?.current ?? noActive.current).toEqual([])
  })

  test("retourne les notes liées à la note active", () => {
    const { result } = renderHook(() => useRelatedNotes("n1", data))
    const ids = result.current.map((n) => n.id)
    expect(ids).toEqual(expect.arrayContaining(["n2", "n3"]))
  })
})
