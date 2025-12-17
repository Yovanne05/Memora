import { useQuery } from "@tanstack/react-query";
import { flashcardsService } from "../services/flashcards.service";
import { FLASHCARDS_QUERY_KEYS } from "./flashcards.keys";
import type { Flashcard } from "../models/flashcard.model";

export function useFlashcardQuery(id: string) {
  return useQuery<Flashcard>({
    queryKey: FLASHCARDS_QUERY_KEYS.detail(id),
    retry: 1,
    queryFn: () => flashcardsService.getById(id),
  });
}
