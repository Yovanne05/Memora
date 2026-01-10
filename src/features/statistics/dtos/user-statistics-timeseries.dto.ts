import type { StatisticsMetric } from "../types/statistics-types"

export type TimeSeriesPointDto = {
  date: string
  value: number
}

export type UserStatisticsTimeSeriesDto = {
  metric: StatisticsMetric
  days: 7 | 30 | 90
  points: TimeSeriesPointDto[]
}