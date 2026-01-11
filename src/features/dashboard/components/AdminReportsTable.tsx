import type { Report } from '@/features/report/models/report'
import { ReportTableRow } from './admin-reports/ReportTableRow'
import { ReportTableEmpty } from './admin-reports/ReportTableEmpty'

type AdminReportsTableProps = {
  reports: Report[]
  isLoading: boolean
  isError: boolean
}

export function AdminReportsTable({
  reports,
  isLoading,
  isError,
}: Readonly<AdminReportsTableProps>) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-3 py-2">Cible</th>
            <th className="px-3 py-2">Titre</th>
            <th className="px-3 py-2">Reporter</th>
            <th className="px-3 py-2">Raison</th>
            <th className="px-3 py-2">Statut</th>
            <th className="px-3 py-2">Date</th>
            <th className="px-3 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {reports.map((report) => (
            <ReportTableRow key={report.id} report={report} />
          ))}
          <ReportTableEmpty
            isLoading={isLoading}
            isError={isError}
            hasReports={reports.length > 0}
          />
        </tbody>
      </table>
    </div>
  )
}
