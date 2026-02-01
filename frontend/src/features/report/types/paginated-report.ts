import type { Report } from '../models/report'

export interface PaginatedReports {
  items: Report[]
  total: number
  offset: number
  limit: number
}
