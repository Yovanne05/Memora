import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import type { UserStatisticsTimeSeries } from "../../models/user-statistics-timeseries.model"
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"
import { TimeseriesRangeSelect } from "./TimeSeriesRangeSelect"
import type { StatisticsMetric, StatisticsRangeDays } from "../../types/statistics-types"

type Props = {
  readonly metric: StatisticsMetric
  readonly days: StatisticsRangeDays
  readonly onChangeDays: (days: StatisticsRangeDays) => void
  readonly query: {
    isLoading: boolean
    isError: boolean
    error: unknown
    data?: UserStatisticsTimeSeries
    refetch: () => void
  }
}

const METRIC_TITLE: Record<StatisticsMetric, string> = {
  notes: "Notes créées",
  collections: "Collections créées",
  reviews: "Révisions",
}


export function TimeseriesChartCard({
  metric,
  days,
  onChangeDays,
  query,
}: Readonly<Props>) {
  const title = METRIC_TITLE[metric]
  const points = query.data?.points ?? []

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="text-base">{title} — {days} jours</CardTitle>
        <TimeseriesRangeSelect value={days} onChange={onChangeDays} />
      </CardHeader>

      <CardContent className="h-[280px]">
        {query.isLoading ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : query.isError ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm text-destructive">
              Impossible de charger le graphique.
            </p>
            <button
              type="button"
              onClick={query.refetch}
              className={cn(
                "text-sm underline underline-offset-4",
                "text-muted-foreground hover:text-foreground"
              )}
            >
              Réessayer
            </button>
          </div>
        ) : points.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Pas de données sur la période.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(iso: string) => {
                  const d = new Date(iso)
                  if (Number.isNaN(d.getTime())) return ""
                  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit" }).format(d)
                }}
              />
              <YAxis allowDecimals={false} />
              <Tooltip
                labelFormatter={(label) => `Date: ${label}`}
                formatter={(value) => [value, "Total"]}
              />
              <Line type="monotone" dataKey="value" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
