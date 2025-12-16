import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { flashcardsService } from "../services/flashcards.service";
import { FLASHCARDS_QUERY_KEYS } from "./flashcards.keys";

export function useDeleteFlashcardMutation(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => flashcardsService.delete(id),
    onSuccess: () => {
      toast.success("Flashcard supprimée avec succès.");
      queryClient.invalidateQueries({ queryKey: FLASHCARDS_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: FLASHCARDS_QUERY_KEYS.all });
      options?.onSuccess?.();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "La suppression de la flashcard a échoué.";
      toast.error(message);
    },
  });
}
