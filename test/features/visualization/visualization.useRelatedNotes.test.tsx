import { renderHook } from "@testing-library/react"
import { useRelatedNotes } from "@/features/visualization/hooks/useRelatedNotes"
import type { Collection } from "@/features/collections/models/collection.model"

const collection: Collection = {
  id: "c1",
  ownerId: "owner",
  name: "Test",
  description: "",
  visibility: "public",
  tags: [],
  notes: [],
  createdAt: "",
  updatedAt: "",
  nodes: [
    { id: "n1", data: { label: "N1", note_id: "n1", title: "N1", tags: [] } },
    { id: "n2", data: { label: "N2", note_id: "n2", title: "N2", tags: [] } },
    { id: "n3", data: { label: "N3", note_id: "n3", title: "N3", tags: [] } },
  ],
  edges: [
    { id: "e1", source: "n1", target: "n2" },
    { id: "e2", source: "n3", target: "n1" },
  ],
}

describe("useRelatedNotes", () => {
  test("retourne une liste vide sans note active ou data", () => {
    const noData = renderHook(() => useRelatedNotes("n1", undefined))
    expect(noData.result.current).toEqual([])

    const noActive = renderHook(() => useRelatedNotes(null, collection))
    expect(noActive.result.current).toEqual([])
  })

  test("retourne les notes liées à la note active", () => {
    const { result } = renderHook(() => useRelatedNotes("n1", collection))
    const ids = result.current.map((n) => n.id)
    expect(ids).toEqual(expect.arrayContaining(["n2", "n3"]))
  })
})
