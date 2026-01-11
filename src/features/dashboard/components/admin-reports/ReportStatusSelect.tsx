import { memo } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUpdateReportMutation } from '@/features/report/hooks/useUpdateReportMutation'
import type { Report } from '@/features/report/models/report'

interface ReportStatusSelectProps {
  report: Report
}

export const ReportStatusSelect = memo(function ReportStatusSelect({
  report,
}: Readonly<ReportStatusSelectProps>) {
  const updateMutation = useUpdateReportMutation()
  const currentStatus = report.status

  const handleChange = async (nextStatus: string) => {
    if (nextStatus === currentStatus) return
    await updateMutation.mutateAsync({
      reportId: report.id,
      payload: { status: nextStatus },
    })
  }

  return (
    <Select value={currentStatus} onValueChange={handleChange}>
      <SelectTrigger className="h-8 w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pending">En attente</SelectItem>
        <SelectItem value="in_progress">En cours</SelectItem>
        <SelectItem value="resolved">Résolu</SelectItem>
        <SelectItem value="rejected">Rejeté</SelectItem>
      </SelectContent>
    </Select>
  )
})
