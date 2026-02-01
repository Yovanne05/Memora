export const REPORTS_QUERY_KEYS = {
  all: ['reports'] as const,
  lists: () => [...REPORTS_QUERY_KEYS.all, 'list'] as const,
  list: (filters: Record<string, unknown> = {}) =>
    [...REPORTS_QUERY_KEYS.lists(), filters] as const,
  details: () => [...REPORTS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...REPORTS_QUERY_KEYS.details(), id] as const,
}
