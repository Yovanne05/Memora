import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Flashcard } from "../models/flashcard.model";
import { FLASHCARDS_QUERY_KEYS } from "./flashcards.keys";

type MutationConfig<TPayload, TData = Flashcard> = {
  mutationFn: (payload: TPayload) => Promise<TData>;
  successMessage: string;
  errorMessage: string;
  onSuccess?: () => void;
};

export function useFlashcardMutation<TPayload, TData = Flashcard>({
  mutationFn,
  successMessage,
  errorMessage,
  onSuccess,
}: MutationConfig<TPayload, TData>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data: TData) => {
      toast.success(successMessage);
      const flashcard = data as Flashcard;
      queryClient.invalidateQueries({ queryKey: FLASHCARDS_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: FLASHCARDS_QUERY_KEYS.byNote(flashcard.noteId) });
      queryClient.setQueryData(FLASHCARDS_QUERY_KEYS.detail(flashcard.id), data);
      onSuccess?.();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : errorMessage;
      toast.error(message);
    },
  });
}
