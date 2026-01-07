import type { StatisticsMetric } from "../types/statistics-types"

export type TimeSeriesPoint = {
  date: string
  value: number
}

export type UserStatisticsTimeSeries = {
  metric: StatisticsMetric
  days: 7 | 30 | 90
  points: TimeSeriesPoint[]
}
