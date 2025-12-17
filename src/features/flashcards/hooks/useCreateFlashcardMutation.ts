import { flashcardsService } from "../services/flashcards.service";
import type { FlashcardCreate } from "../models/flashcard.model";
import { useFlashcardMutation } from "./useFlashcardMutationFactory";

export function useCreateFlashcardMutation(options?: { onSuccess?: () => void }) {
  return useFlashcardMutation({
    mutationFn: (payload: FlashcardCreate) => flashcardsService.create(payload),
    successMessage: "Flashcard créée avec succès.",
    errorMessage: "La création de la flashcard a échoué.",
    onSuccess: options?.onSuccess,
  });
}
