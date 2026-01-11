import { memo } from 'react'
import { Badge } from '@/components/ui/badge'
import type { Report } from '@/features/report/models/report'
import { ReportStatusSelect } from './ReportStatusSelect'
import { ReportTableActions } from './ReportTableActions'

interface ReportTableRowProps {
  report: Report
}

function formatReason(reason: string) {
  return reason
    .split('_')
    .map((segment) =>
      segment.length > 0
        ? `${segment[0].toUpperCase()}${segment.slice(1)}`
        : segment
    )
    .join(' ')
}

export const ReportTableRow = memo(function ReportTableRow({
  report,
}: Readonly<ReportTableRowProps>) {
  return (
    <tr className="hover:bg-accent/40">
      <td className="px-3 py-3">
        <Badge variant="outline">
          {report.targetType === 'note' ? 'Note' : 'Collection'}
        </Badge>
      </td>
      <td className="px-3 py-3 font-medium">
        {report.noteTitle || report.collectionName || 'Sans titre'}
      </td>
      <td className="px-3 py-3">
        {report.reporterEmail || report.reporterId}
      </td>
      <td className="px-3 py-3">{formatReason(report.reason)}</td>
      <td className="px-3 py-3">
        <ReportStatusSelect report={report} />
      </td>
      <td className="px-3 py-3 text-muted-foreground">
        {new Date(report.createdAt).toLocaleDateString('fr-FR')}
      </td>
      <td className="px-3 py-3 text-right">
        <ReportTableActions report={report} />
      </td>
    </tr>
  )
})
