import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import type { Report } from '@/features/report/models/report'
import { DeleteReportCollectionDialog } from './DeleteReportCollectionDialog'
import { DeleteReportNoteDialog } from './DeleteReportNoteDialog'
import { ResolveReportDialog } from './ResolveReportDialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUpdateReportMutation } from '@/features/report/hooks/useUpdateReportMutation'

type AdminReportsTableProps = {
  reports: Report[]
  isLoading: boolean
  isError: boolean
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

function ReportStatusSelect({ report }: { report: Report }) {
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
            <tr key={report.id} className="hover:bg-accent/40">
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
                <div className="flex items-center justify-end gap-2">
                  {report.targetType === 'note' ? (
                    <>
                      <Button size="sm" variant="secondary" asChild>
                        <Link
                          to="/app/workspace/notes/$noteId"
                          params={{ noteId: report.noteId ?? '' }}
                          disabled={!report.noteId}
                        >
                          Examiner
                        </Link>
                      </Button>
                      {report.status !== 'resolved' &&
                        report.status !== 'rejected' && (
                          <>
                            <ResolveReportDialog reportId={report.id} />
                            <DeleteReportNoteDialog
                              reportId={report.id}
                              noteId={report.noteId}
                              noteTitle={report.noteTitle}
                            />
                          </>
                        )}
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="secondary" asChild>
                        <Link
                          to="/app/workspace/collections/$collectionId"
                          params={{ collectionId: report.collectionId ?? '' }}
                          disabled={!report.collectionId}
                        >
                          Examiner
                        </Link>
                      </Button>
                      {report.status !== 'resolved' &&
                        report.status !== 'rejected' && (
                          <>
                            <ResolveReportDialog reportId={report.id} />
                            <DeleteReportCollectionDialog
                              reportId={report.id}
                              collectionId={report.collectionId}
                              collectionName={report.collectionName}
                            />
                          </>
                        )}
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {!isLoading && !isError && reports.length === 0 && (
            <tr>
              <td
                colSpan={7}
                className="px-3 py-8 text-center text-muted-foreground"
              >
                Aucun signalement ne correspond aux filtres.
              </td>
            </tr>
          )}
          {isLoading && (
            <tr>
              <td
                colSpan={7}
                className="px-3 py-8 text-center text-muted-foreground"
              >
                Chargement des signalements...
              </td>
            </tr>
          )}
          {isError && (
            <tr>
              <td
                colSpan={7}
                className="px-3 py-8 text-center text-destructive"
              >
                Impossible de charger les signalements.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
