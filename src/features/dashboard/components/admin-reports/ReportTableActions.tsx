import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import type { Report } from '@/features/report/models/report'
import { DeleteReportCollectionDialog } from '../DeleteReportCollectionDialog'
import { DeleteReportNoteDialog } from '../DeleteReportNoteDialog'
import { ResolveReportDialog } from '../ResolveReportDialog'

interface ReportTableActionsProps {
  report: Report
}

export const ReportTableActions = memo(function ReportTableActions({
  report,
}: Readonly<ReportTableActionsProps>) {
  const isResolved = report.status === 'resolved' || report.status === 'rejected'

  if (report.targetType === 'note') {
    return (
      <div className="flex items-center justify-end gap-2">
        <Button size="sm" variant="secondary" asChild>
          <Link
            to="/app/workspace/notes/$noteId"
            params={{ noteId: report.noteId ?? '' }}
            disabled={!report.noteId}
          >
            Examiner
          </Link>
        </Button>
        {!isResolved && (
          <>
            <ResolveReportDialog reportId={report.id} />
            <DeleteReportNoteDialog
              reportId={report.id}
              noteId={report.noteId}
              noteTitle={report.noteTitle}
            />
          </>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Button size="sm" variant="secondary" asChild>
        <Link
          to="/app/workspace/collections/$collectionId"
          params={{ collectionId: report.collectionId ?? '' }}
          disabled={!report.collectionId}
        >
          Examiner
        </Link>
      </Button>
      {!isResolved && (
        <>
          <ResolveReportDialog reportId={report.id} />
          <DeleteReportCollectionDialog
            reportId={report.id}
            collectionId={report.collectionId}
            collectionName={report.collectionName}
          />
        </>
      )}
    </div>
  )
})
