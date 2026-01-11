import { flashcardsService } from '../services/flashcards.service'
import type { FlashcardCreate } from '../models/flashcard.model'
import { useFlashcardMutation } from './useFlashcardMutationFactory'

export function useCreateFlashcardMutation(options?: {
  onSuccess?: () => void
}) {
  return useFlashcardMutation({
    mutationFn: (payload: FlashcardCreate) => flashcardsService.create(payload),
    successMessage: 'Flashcard créée avec succès',
    errorContext: {
      operation: 'create',
      resource: 'flashcard',
    },
    onSuccess: options?.onSuccess,
  })
}
