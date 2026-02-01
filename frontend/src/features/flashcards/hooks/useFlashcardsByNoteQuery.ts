import { useQuery } from "@tanstack/react-query";
import { flashcardsService } from "../services/flashcards.service";
import { FLASHCARDS_QUERY_KEYS } from "./flashcards.keys";
import type { Flashcard } from "../models/flashcard.model";

export function useFlashcardsByNoteQuery(noteId: string | null | undefined) {
  return useQuery<Flashcard[]>({
    queryKey: FLASHCARDS_QUERY_KEYS.byNote(noteId ?? ""),
    queryFn: async () => {
      if (!noteId) return [];
      const result = await flashcardsService.list({ noteId });
      return result.items;
    },
    enabled: !!noteId,
    retry: 1,
  });
}
