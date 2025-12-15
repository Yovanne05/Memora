import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { flashcardsService } from "../services/flashcards.service";
import type { Flashcard, FlashcardCreate } from "../models/flashcard.model";
import { FLASHCARDS_QUERY_KEYS } from "./flashcards.keys";

export function useCreateFlashcardMutation(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FlashcardCreate) => flashcardsService.create(payload),
    onSuccess: (data: Flashcard) => {
      toast.success("Flashcard créée avec succès.");
      queryClient.invalidateQueries({ queryKey: FLASHCARDS_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: FLASHCARDS_QUERY_KEYS.byNote(data.noteId) });
      queryClient.setQueryData(FLASHCARDS_QUERY_KEYS.detail(data.id), data);
      options?.onSuccess?.();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "La création de la flashcard a échoué.";
      toast.error(message);
    },
  });
}
