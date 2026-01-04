import { useState, useMemo } from "react"
import { useNotesQuery } from "./useNotesQuery"
import { useCreateNoteLinkMutation } from "./useCreateNoteLinkMutation"
import type { Note } from "../models/note.model"
import type { NoteLink } from "../models/note-link.model"

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
    () => new Set(existingLinks.map(l => l.linkedNoteId)),
    [existingLinks]
  )

  const availableNotes = useMemo(() => {
    const notes = notesData?.items ?? []
    return notes
      .filter(n => n.id !== note.id)
      .filter(n => !existingLinkIds.has(n.id))
      .filter(n =>
        searchQuery === "" ||
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
  }, [notesData, note.id, existingLinkIds, searchQuery])

  const handleCreateLink = async (linkedNoteId: string) => {
    try {
      await createLinkMutation.mutateAsync({ linkedNoteId })
      setSelectedNoteId(null)
      setSearchQuery("")
      onSuccess?.()
      return true
    } catch (error) {
      console.error("Failed to create link:", error)
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
