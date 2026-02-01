import { useMemo, useState } from 'react'
import { AdminReportsFilters } from './AdminReportsFilters'
import { AdminReportsTable } from './AdminReportsTable'
import { useReportsQuery } from '@/features/report/hooks/useReportQuery'
import type { ReportsFilters } from '@/features/report/types/report-query'

export function AdminReportsTableContainer() {
  const [status, setStatus] = useState('pending')
  const [target, setTarget] = useState('all')

  const filters = useMemo<ReportsFilters>(() => {
    const next: ReportsFilters = {}

    if (status) next.status = status
    if (target !== 'all') next.targetType = target

    return next
  }, [status, target])

  const { data, isLoading, isError } = useReportsQuery(filters)

  return (
    <section className="space-y-4">
      <AdminReportsFilters
        status={status}
        target={target}
        onStatusChange={setStatus}
        onTargetChange={setTarget}
      />
      <AdminReportsTable
        reports={data?.items ?? []}
        isLoading={isLoading}
        isError={isError}
      />
    </section>
  )
}
