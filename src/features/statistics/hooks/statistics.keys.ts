export const USER_STATISTICS_QUERY_KEYS = {
  all: () => ["user-statistics"] as const,
  me: () => [...USER_STATISTICS_QUERY_KEYS.all(), "me"] as const,
}
