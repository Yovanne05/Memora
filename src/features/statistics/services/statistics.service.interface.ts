import type { UserStatistics } from "../models/user-statistics.model"
import type { UserStatisticsTimeSeries } from "../models/user-statistics-timeseries.model"
import type { StatisticsMetric, StatisticsRangeDays } from "../types/statistics-types"

export interface IUserStatisticsService {
  getMyStatistics(): Promise<UserStatistics>
  getMyTimeSeries(metric: StatisticsMetric, days: StatisticsRangeDays): Promise<UserStatisticsTimeSeries>
}