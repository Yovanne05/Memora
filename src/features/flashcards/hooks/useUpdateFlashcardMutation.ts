import { flashcardsService } from "../services/flashcards.service";
import type { FlashcardUpdate } from "../models/flashcard.model";
import { useFlashcardMutation } from "./useFlashcardMutationFactory";

export function useUpdateFlashcardMutation(options?: { onSuccess?: () => void }) {
  return useFlashcardMutation({
    mutationFn: ({ id, payload }: { id: string; payload: FlashcardUpdate }) =>
      flashcardsService.update(id, payload),
    successMessage: "Flashcard modifiée avec succès.",
    errorMessage: "La modification de la flashcard a échoué.",
    onSuccess: options?.onSuccess,
  });
}
