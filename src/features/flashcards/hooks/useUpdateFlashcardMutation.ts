import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { flashcardsService } from "../services/flashcards.service";
import type { Flashcard, FlashcardUpdate } from "../models/flashcard.model";
import { FLASHCARDS_QUERY_KEYS } from "./flashcards.keys";

export function useUpdateFlashcardMutation(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: FlashcardUpdate }) =>
      flashcardsService.update(id, payload),
    onSuccess: (data: Flashcard) => {
      toast.success("Flashcard modifiée avec succès.");
      queryClient.invalidateQueries({ queryKey: FLASHCARDS_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: FLASHCARDS_QUERY_KEYS.byNote(data.noteId) });
      queryClient.setQueryData(FLASHCARDS_QUERY_KEYS.detail(data.id), data);
      options?.onSuccess?.();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "La modification de la flashcard a échoué.";
      toast.error(message);
    },
  });
}
