import type { Report, ReportCreate, ReportUpdate } from '../models/report'
import type { ReportsFilters } from '../types/report-query'
import type { PaginatedReports } from '../types/paginated-report'

export interface IReportsService {
  list(params?: ReportsFilters): Promise<PaginatedReports>
  get(id: string): Promise<Report>
  reportNote(noteId: string, payload: ReportCreate): Promise<Report>
  reportCollection(collectionId: string, payload: ReportCreate): Promise<Report>
  update(id: string, payload: ReportUpdate): Promise<Report>
}
