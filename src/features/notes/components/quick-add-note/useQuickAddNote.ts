import { useState } from "react"
import { toast } from "sonner"

import { useAuth } from "@/features/auth/hooks/useAuth"
import { useCreateNoteMutation } from "../../hooks/useCreateNoteMutation"
import type { NoteVisibility } from "../../models/note.model"

type UseQuickAddNoteArgs = {
  collectionId?: string | null
  onSuccess?: () => void
}

export function useQuickAddNote({ collectionId, onSuccess }: UseQuickAddNoteArgs) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [visibility, setVisibility] = useState<NoteVisibility>("private")

  const { user } = useAuth()
  const createMutation = useCreateNoteMutation({
    onSuccess: () => {
      onSuccess?.()
      handleClose()
    },
  })

  const handleClose = () => {
    setOpen(false)
    setTitle("")
    setVisibility("private")
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!title.trim()) {
      toast.error("Le titre est requis")
      return
    }

    if (!user) {
      toast.error("Vous devez être connecté")
      return
    }

    await createMutation.mutateAsync({
      ownerId: user.id,
      title: title.trim(),
      content: "",
      collectionId,
      visibility,
      tags: [],
    })
  }

  return {
    open,
    setOpen,
    title,
    setTitle,
    visibility,
    setVisibility,
    createMutation,
    handleSubmit,
    handleClose,
  }
}
