import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { flashcardsService } from "../services/flashcards.service";
import { FLASHCARDS_QUERY_KEYS } from "./flashcards.keys";
import type { FlashcardsFilters } from "../types/flashcard-query";
import type { PaginatedFlashcards } from "../types/paginated-flashcard";

export function useFlashcardsQuery(
  page: number,
  limit: number,
  filters: FlashcardsFilters = {}
) {
  return useQuery<PaginatedFlashcards>({
    queryKey: FLASHCARDS_QUERY_KEYS.list({ page, limit, ...filters }),
    retry: 1,
    queryFn: () =>
      flashcardsService.list({
        ...filters,
        limit,
        offset: page * limit,
      }),
    placeholderData: keepPreviousData,
  });
}
