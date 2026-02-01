/**
 * Query keys pour les notes.
 * Centralisation des clés de requête pour une meilleure organisation.
 */
export const NOTES_QUERY_KEYS = {
  all: ["notes"] as const,
  lists: () => [...NOTES_QUERY_KEYS.all, "list"] as const,
  list: (filters: Record<string, unknown> = {}) =>
    [...NOTES_QUERY_KEYS.lists(), filters] as const,
  details: () => [...NOTES_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...NOTES_QUERY_KEYS.details(), id] as const,
}
