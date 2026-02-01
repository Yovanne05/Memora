import { useMemo, useState } from 'react'
import { BookOpenCheck, Folder, StickyNote } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { getContextualErrorMessage } from '@/lib/error-context'

import type {
  StatisticsMetric,
  StatisticsRangeDays,
} from '../types/statistics-types'
import { useUserStatisticsQuery } from '../hooks/useUserStatisticsQuery'
import { useUserStatisticsTimeseriesQuery } from '../hooks/useUserStatisticsTimeSeriesQuery'
import { StatisticsLoading } from '../components/states/StatisticsLoading'
import { StatisticsError } from '../components/states/StatisticsError'
import { StatisticsHeader } from '../components/layout/StatisticsHeader'
import { SummaryCard } from '../components/summary/SummaryCard'
import { SummaryGrid } from '../components/summary/SummaryGrid'
import { TimeseriesChartCard } from '../components/charts/TimeSeriesChartCard'

export default function StatisticsPage() {
  const statsQuery = useUserStatisticsQuery()

  const [selectedMetric, setSelectedMetric] =
    useState<StatisticsMetric>('notes')
  const [days, setDays] = useState<StatisticsRangeDays>(30)

  const chartQuery = useUserStatisticsTimeseriesQuery(
    selectedMetric,
    days,
    true
  )

  const totals = useMemo(() => {
    const c = statsQuery.data?.contentStatistics
    return {
      notes: c?.notesCreated ?? 0,
      collections: c?.collectionsCreated ?? 0,
      flashcards: c?.flashcardsCreated ?? 0,
    }
  }, [statsQuery.data])

  if (statsQuery.isLoading) return <StatisticsLoading />
  if (statsQuery.isError) {
    return (
      <StatisticsError
        message={getContextualErrorMessage(statsQuery.error, {
          operation: 'fetch',
          resource: 'user',
          fallback: undefined,
        })}
        onRetry={() => {
          void statsQuery.refetch()
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <StatisticsHeader />

      <Separator />

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Résumé</h2>

        <SummaryGrid>
          <SummaryCard
            title="Notes totales"
            value={totals.notes}
            icon={<StickyNote className="h-4 w-4" />}
            active={selectedMetric === 'notes'}
            onSelectChart={() => setSelectedMetric('notes')}
            chartLabel="Afficher le graphique des notes"
          />

          <SummaryCard
            title="Collections totales"
            value={totals.collections}
            icon={<Folder className="h-4 w-4" />}
            active={selectedMetric === 'collections'}
            onSelectChart={() => setSelectedMetric('collections')}
            chartLabel="Afficher le graphique des collections"
          />

          <SummaryCard
            title="Révisions totales"
            value={statsQuery.data?.reviewStatistics?.totalReviews ?? 0}
            icon={<BookOpenCheck className="h-4 w-4" />}
            active={selectedMetric === 'reviews'}
            onSelectChart={() => setSelectedMetric('reviews')}
            chartLabel="Afficher le graphique des révisions"
          />
        </SummaryGrid>
      </div>

      <div className="space-y-3">
        <TimeseriesChartCard
          metric={selectedMetric}
          days={days}
          onChangeDays={setDays}
          query={{
            isLoading: chartQuery.isLoading,
            isError: chartQuery.isError,
            error: chartQuery.error,
            data: chartQuery.data,
            refetch: () => {
              void chartQuery.refetch()
            },
          }}
        />
      </div>
    </div>
  )
}
