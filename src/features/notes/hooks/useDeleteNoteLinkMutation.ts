import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { noteLinksService } from '../services/note-links.service'
import type { NoteLink } from '../models/note-link.model'
import { NOTE_LINKS_QUERY_KEYS } from './note-links.keys'
import { getContextualErrorMessage } from '@/lib/error-context'
import { logger } from '@/lib/logger'

interface MutationCallbacks {
  onSuccess?: () => void
  onError?: (error: Error) => void
  silent?: boolean
}

export function useDeleteNoteLinkMutation(
  noteId: string,
  callbacks?: MutationCallbacks
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (linkedNoteId: string) =>
      noteLinksService.remove(noteId, linkedNoteId),
    onSuccess: (_, linkedNoteId) => {
      if (!callbacks?.silent) {
        toast.success('Lien supprimé')
      }

      queryClient.setQueryData(
        NOTE_LINKS_QUERY_KEYS.list(noteId),
        (old: NoteLink[] | undefined) =>
          old?.filter((link) => link.linkedNoteId !== linkedNoteId) ?? []
      )

      queryClient.invalidateQueries({
        queryKey: NOTE_LINKS_QUERY_KEYS.lists(),
      })

      queryClient.invalidateQueries({ queryKey: ['visualization'] })

      callbacks?.onSuccess?.()
    },
    onError: (error: Error) => {
      if (!callbacks?.silent) {
        const message = getContextualErrorMessage(error, {
          operation: 'delete',
          resource: 'note',
          fallback: 'Impossible de supprimer le lien',
        })
        toast.error(message)
      }
      logger.error('Failed to delete note link:', error)
      callbacks?.onError?.(error)
    },
  })
}
