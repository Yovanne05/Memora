export const USERS_QUERY_KEYS = {
  all: ['users'] as const,
  lists: () => [...USERS_QUERY_KEYS.all, 'list'] as const,
  list: (filters: Record<string, unknown> = {}) =>
    [...USERS_QUERY_KEYS.lists(), filters] as const,
  details: () => [...USERS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...USERS_QUERY_KEYS.details(), id] as const,
}
