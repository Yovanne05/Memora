import type { QueryParamValue } from '@/types/query-params'
import type { PaginationParams } from '@/types/pagination'

export type ReportSortBy = 'created_at' | 'status'
export type ReportSortDir = 'asc' | 'desc'

export type ReportsFilters = Record<string, QueryParamValue> &
  PaginationParams & {
    status?: string
    reason?: string
    targetType?: string
    reporterId?: string
    noteId?: string
    collectionId?: string
    sortBy?: ReportSortBy
    sortDir?: ReportSortDir
  }
