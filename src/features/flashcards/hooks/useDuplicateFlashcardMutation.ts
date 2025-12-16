import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { flashcardsService } from "../services/flashcards.service";
import type { Flashcard, FlashcardDuplicate } from "../models/flashcard.model";
import { FLASHCARDS_QUERY_KEYS } from "./flashcards.keys";

export function useDuplicateFlashcardMutation(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: FlashcardDuplicate }) =>
      flashcardsService.duplicate(id, payload),
    onSuccess: (data: Flashcard) => {
      toast.success("Flashcard dupliquée avec succès.");
      queryClient.invalidateQueries({ queryKey: FLASHCARDS_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: FLASHCARDS_QUERY_KEYS.byNote(data.noteId) });
      queryClient.setQueryData(FLASHCARDS_QUERY_KEYS.detail(data.id), data);
      options?.onSuccess?.();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "La duplication de la flashcard a échoué.";
      toast.error(message);
    },
  });
}
