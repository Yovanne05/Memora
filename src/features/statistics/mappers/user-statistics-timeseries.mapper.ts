import type { UserStatisticsTimeSeriesDto } from "../dtos/user-statistics-timeseries.dto"
import type { UserStatisticsTimeSeries } from "../models/user-statistics-timeseries.model"
import type { StatisticsRangeDays } from "../types/statistics-types"

const isRange = (n: number): n is StatisticsRangeDays => n === 7 || n === 30 || n === 90

export function dtoToUserStatisticsTimeSeries(
  dto: UserStatisticsTimeSeriesDto
): UserStatisticsTimeSeries {
  const days = isRange(dto.days) ? dto.days : 30

  return {
    metric: dto.metric,
    days,
    points: dto.points ?? [],
  }
}
