import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ReportUpdate } from '../models/report'
import { reportsService } from '../services/report.service'
import { REPORTS_QUERY_KEYS } from '../constants/reports.key'

type UpdateReportParams = {
  reportId: string
  payload: ReportUpdate
}

export function useUpdateReportMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ reportId, payload }: UpdateReportParams) =>
      reportsService.update(reportId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: REPORTS_QUERY_KEYS.lists(),
      })
      queryClient.invalidateQueries({
        queryKey: REPORTS_QUERY_KEYS.detail(variables.reportId),
      })
    },
  })
}
