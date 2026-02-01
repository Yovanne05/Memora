import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { MutationCallbacks } from '@/lib/mutation-callbacks'
import { getContextualErrorMessage } from '@/lib/error-context'

import { notesService } from '../services/notes.service'
import type { Note, NoteUpdate } from '../models/note.model'
import { NOTES_QUERY_KEYS } from './notes.keys'
import { logger } from '@/lib/logger'

export function useUpdateNoteMutation(callbacks?: MutationCallbacks<Note>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      noteId,
      payload,
    }: {
      noteId: string
      payload: NoteUpdate
    }) => notesService.update(noteId, payload),
    onSuccess: (data: Note) => {
      if (!callbacks?.silent) {
        toast.success('Note mise à jour')
      }
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEYS.lists() })
      queryClient.setQueryData(NOTES_QUERY_KEYS.detail(data.id), data)
      callbacks?.onSuccess?.(data)
    },
    onError: (error: Error) => {
      if (!callbacks?.silent) {
        const message = getContextualErrorMessage(error, {
          operation: 'update',
          resource: 'note',
        })
        toast.error(message)
      }
      logger.error('Failed to update note:', error)
      callbacks?.onError?.(error)
    },
  })
}
