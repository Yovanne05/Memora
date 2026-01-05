import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import type { MutationCallbacks } from "@/lib/mutation-callbacks"

import { noteImagesService } from "../services/note-images.service"
import type { NoteImage, NoteImageUploadPayload } from "../models/note-image.model"

export function useUploadNoteImageMutation(callbacks?: MutationCallbacks<NoteImage>) {
  return useMutation({
    mutationFn: (payload: NoteImageUploadPayload) => {
      return noteImagesService.upload(payload)
    },
    onSuccess: (data: NoteImage) => {
      if (!callbacks?.silent) {
        toast.success("Image uploadée avec succès.")
      }
      callbacks?.onSuccess?.(data)
    },
    onError: (error: Error) => {
      if (!callbacks?.silent) {
        const message = error instanceof Error ? error.message : "L'upload de l'image a échoué."
        toast.error(message)
      }
      console.error("Failed to upload image:", error)
      callbacks?.onError?.(error)
    },
  })
}
