export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

export interface PaginationParams {
  limit?: number
  offset?: number
}

export type ListParams<F = object> = F & PaginationParams
