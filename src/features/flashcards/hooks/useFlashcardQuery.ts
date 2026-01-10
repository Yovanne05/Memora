import { useQuery } from '@tanstack/react-query'
import { flashcardsService } from '../services/flashcards.service'

export const FLASHCARD_QUERY_KEYS = {
  all: ['flashcards'] as const,
  byId: (id: string) => [...FLASHCARD_QUERY_KEYS.all, id] as const,
}

export function useFlashcardQuery(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: FLASHCARD_QUERY_KEYS.byId(id),
    queryFn: () => flashcardsService.getById(id),
    enabled: options?.enabled ?? true,
  })
}
