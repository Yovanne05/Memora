import { useMemo } from "react"
import type { CollectionVisualization } from "../types/visualization.type"
import type { Note } from "../../notes/models/note.model"

export function useRelatedNotes(
  activeNoteId: string | null,
  data?: CollectionVisualization
): Note[] {
  return useMemo(() => {
    if (!activeNoteId || !data) return []

    const connectedNodeIds = new Set<string>()

    data.edges.forEach((edge) => {
      if (edge.sourceId === activeNoteId) {
        connectedNodeIds.add(edge.targetId)
      } else if (edge.targetId === activeNoteId) {
        connectedNodeIds.add(edge.sourceId)
      }
    })

    return data.nodes
      .filter((node) => connectedNodeIds.has(node.id))
      .map((node) => ({
        id: node.id,
        title: node.title,
        content: "",
        visibility: "private" as const,
        ownerId: "",
        collectionId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))
  }, [activeNoteId, data])
}
