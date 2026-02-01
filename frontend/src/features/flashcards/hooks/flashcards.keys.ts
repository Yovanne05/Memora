export const FLASHCARDS_QUERY_KEYS = {
  all: ["flashcards"] as const,
  lists: () => [...FLASHCARDS_QUERY_KEYS.all, "list"] as const,
  list: (filters: Record<string, unknown> = {}) =>
    [...FLASHCARDS_QUERY_KEYS.lists(), filters] as const,
  details: () => [...FLASHCARDS_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...FLASHCARDS_QUERY_KEYS.details(), id] as const,
  byNote: (noteId: string) =>
    [...FLASHCARDS_QUERY_KEYS.all, "by-note", noteId] as const,
};
