import { useMemo } from "react"
import type { Collection } from "@/features/collections/models/collection.model"
import type { Note } from "../../notes/models/note.model"

export function useRelatedNotes(
  activeNoteId: string | null,
  collection?: Collection
): Note[] {
  return useMemo(() => {
    if (!activeNoteId || !collection) return []

    const connectedNodeIds = new Set<string>()

    collection.edges.forEach((edge) => {
      if (edge.source === activeNoteId) {
        connectedNodeIds.add(edge.target)
      } else if (edge.target === activeNoteId) {
        connectedNodeIds.add(edge.source)
      }
    })

    return collection.nodes
      .filter((node) => connectedNodeIds.has(node.id))
      .map((node) => ({
        id: node.id,
        title: node.data.title,
        content: "",
        visibility: "private" as const,
        ownerId: "",
        collectionId: null,
        tags: node.data.tags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))
  }, [activeNoteId, collection])
}
