import type { MutationCallbacks } from '@/lib/mutation-callbacks'
import { useDeleteMutation } from '@/hooks/useResourceMutation'

import { notesService } from '../services/notes.service'
import { NOTES_QUERY_KEYS } from './notes.keys'

export function useDeleteNoteMutation(callbacks?: MutationCallbacks<void>) {
  return useDeleteMutation<{ id: string }>(
    {
      mutationFn: ({ id }) => notesService.remove(id),
      listQueryKey: NOTES_QUERY_KEYS.lists(),
      successMessage: 'Note supprimée',
      errorContext: {
        operation: 'delete',
        resource: 'note',
      },
    },
    callbacks
  )
}
