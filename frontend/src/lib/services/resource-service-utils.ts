export interface PaginatedResponse<T> {
  items: T[]
  total: number
  offset?: number
  limit?: number
}

export function normalizeListResponse<T>(
  data: T[] | { items: T[]; total: number },
  offset?: number,
  limit?: number
): PaginatedResponse<T> {
  const items = Array.isArray(data) ? data : data?.items ?? []
  const total = Array.isArray(data) ? items.length : data?.total ?? items.length

  return {
    items,
    total,
    offset,
    limit,
  }
}

export function camelToSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

export function transformFilterKeys<T extends Record<string, unknown>>(
  filters: T
): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) {
      result[camelToSnakeCase(key)] = value
    }
  }

  return result
}
