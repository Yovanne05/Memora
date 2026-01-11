import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { MutationCallbacks } from '@/lib/mutation-callbacks'
import { getContextualErrorMessage } from '@/lib/error-context'

import { noteImagesService } from '../services/note-images.service'
import type {
  NoteImage,
  NoteImageUploadPayload,
} from '../models/note-image.model'
import { logger } from '@/lib/logger'

export function useUploadNoteImageMutation(
  callbacks?: MutationCallbacks<NoteImage>
) {
  return useMutation({
    mutationFn: (payload: NoteImageUploadPayload) => {
      return noteImagesService.upload(payload)
    },
    onSuccess: (data: NoteImage) => {
      if (!callbacks?.silent) {
        toast.success('Image uploadée')
      }
      callbacks?.onSuccess?.(data)
    },
    onError: (error: Error) => {
      if (!callbacks?.silent) {
        const message = getContextualErrorMessage(error, {
          operation: 'create',
          resource: 'note',
          fallback: "Impossible d'uploader l'image",
        })
        toast.error(message)
      }
      logger.error('Failed to upload image:', error)
      callbacks?.onError?.(error)
    },
  })
}
