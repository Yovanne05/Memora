import { useState } from "react"
import { toast } from "sonner"

import { useNoteLinksQuery } from "./useNoteLinksQuery"
import { useLinkNotes } from "./useLinkNotes"
import type { Note } from "../models/note.model"

type UseQuickLinkNoteArgs = {
  note: Note
  onSuccess?: () => void
}

export function useQuickLinkNote({ note, onSuccess }: UseQuickLinkNoteArgs) {
  const [open, setOpen] = useState(false)
  const { data: existingLinks = [] } = useNoteLinksQuery(note.id)

  const {
    searchQuery,
    setSearchQuery,
    availableNotes,
    isLoading,
    isPending,
    handleCreateLink,
    resetState,
  } = useLinkNotes({
    note,
    existingLinks,
    onSuccess: () => {
      setOpen(false)
      onSuccess?.()
    },
  })

  const handleLinkNote = async (targetNoteId: string, targetNoteTitle: string) => {
    const success = await handleCreateLink(targetNoteId)
    if (success) {
      toast.success(`Note liée à "${targetNoteTitle}"`)
      return
    }
    toast.error("Erreur lors de la liaison de la note")
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      resetState()
    }
  }

  return {
    open,
    setOpen,
    searchQuery,
    setSearchQuery,
    availableNotes,
    isLoading,
    isPending,
    handleLinkNote,
    handleOpenChange,
  }
}

