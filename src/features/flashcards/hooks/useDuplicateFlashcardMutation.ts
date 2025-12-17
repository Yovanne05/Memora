import { flashcardsService } from "../services/flashcards.service";
import type { FlashcardDuplicate } from "../models/flashcard.model";
import { useFlashcardMutation } from "./useFlashcardMutationFactory";

export function useDuplicateFlashcardMutation(options?: { onSuccess?: () => void }) {
  return useFlashcardMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: FlashcardDuplicate }) =>
      flashcardsService.duplicate(id, payload),
    successMessage: "Flashcard dupliquée avec succès.",
    errorMessage: "La duplication de la flashcard a échoué.",
    onSuccess: options?.onSuccess,
  });
}
