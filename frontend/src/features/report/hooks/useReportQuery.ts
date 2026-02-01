import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { ReportsFilters } from '../types/report-query'
import { REPORTS_QUERY_KEYS } from '../constants/reports.key'
import { reportsService } from '../services/report.service'

export function useReportsQuery(params: ReportsFilters) {
  return useQuery({
    queryKey: REPORTS_QUERY_KEYS.list(params),
    queryFn: () => reportsService.list(params),
    placeholderData: keepPreviousData,
  })
}
