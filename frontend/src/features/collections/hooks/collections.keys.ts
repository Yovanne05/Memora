export const COLLECTIONS_QUERY_KEYS = {
  all: ['collections'] as const,
  lists: () => [...COLLECTIONS_QUERY_KEYS.all, 'list'] as const,
  list: (filters: Record<string, unknown> = {}) => [
    ...COLLECTIONS_QUERY_KEYS.lists(),
    filters,
  ] as const,
  details: () => [...COLLECTIONS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...COLLECTIONS_QUERY_KEYS.details(), id] as const,
}
