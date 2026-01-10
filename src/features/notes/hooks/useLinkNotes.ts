import { useState, useMemo } from "react"
import { useNotesQuery } from "./useNotesQuery"
import { useCreateNoteLinkMutation } from "./useCreateNoteLinkMutation"
import type { Note } from "../models/note.model"
import type { NoteLink } from "../models/note-link.model"
import { logger } from "@/lib/logger"

interface UseLinkNotesOptions {
  note: Note
  existingLinks?: NoteLink[]
  onSuccess?: () => void
}

export function useLinkNotes({ note, existingLinks = [], onSuccess }: UseLinkNotesOptions) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)

  const { data: notesData, isLoading } = useNotesQuery(0, 100, {
    collection_id: note.collectionId,
  })

  const createLinkMutation = useCreateNoteLinkMutation(note.id)

  const existingLinkIds = useMemo(
    () => new Set(existingLinks.map((link) => link.linkedNoteId)),
    [existingLinks]
  )

  const availableNotes = useMemo(() => {
    const notes = notesData?.items ?? []
    const normalizedSearch = searchQuery.trim().toLowerCase()

    return notes
      .filter((candidateNote) => candidateNote.id !== note.id)
      .filter((candidateNote) => !existingLinkIds.has(candidateNote.id))
      .filter((candidateNote) => {
        if (normalizedSearch === "") return true
        return (
          candidateNote.title.toLowerCase().includes(normalizedSearch) ||
          candidateNote.content.toLowerCase().includes(normalizedSearch)
        )
      })
  }, [notesData, note.id, existingLinkIds, searchQuery])

  const handleCreateLink = async (linkedNoteId: string, label: string) => {
    const normalizedLabel = label.trim()

    if (normalizedLabel.length === 0) {
      return false
    }

    try {
      await createLinkMutation.mutateAsync({
        linkedNoteId,
        label: normalizedLabel,
      })

      setSelectedNoteId(null)
      setSearchQuery("")
      onSuccess?.()
      return true
    } catch (error) {
      logger.error("Failed to create link:", error)
      return false
    }
  }

  const resetState = () => {
    setSelectedNoteId(null)
    setSearchQuery("")
  }

  return {
    searchQuery,
    setSearchQuery,
    selectedNoteId,
    setSelectedNoteId,
    availableNotes,
    isLoading,
    isPending: createLinkMutation.isPending,
    handleCreateLink,
    resetState,
  }
}
