import { httpClient, type HttpClient } from "@/lib/http-client"
import type { UserStatisticsDto } from "../dtos/user-statistics.dto"
import type { UserStatisticsTimeSeriesDto } from "../dtos/user-statistics-timeseries.dto"
import { dtoToUserStatistics } from "../mappers/user-statistics.mapper"
import { dtoToUserStatisticsTimeSeries } from "../mappers/user-statistics-timeseries.mapper"
import type { StatisticsMetric, StatisticsRangeDays } from "../types/statistics-types"
import type { IUserStatisticsService } from "./statistics.service.interface"

export function createUserStatisticsService(
  client: HttpClient = httpClient
): IUserStatisticsService {
  return {
    async getMyStatistics() {
      const dto = await client.get<UserStatisticsDto>("/users/me/statistics")
      return dtoToUserStatistics(dto)
    },

    async getMyTimeSeries(metric: StatisticsMetric, days: StatisticsRangeDays) {
      const dto = await client.get<UserStatisticsTimeSeriesDto>("/users/me/statistics/timeseries", {
        params: { metric, days },
      })
      return dtoToUserStatisticsTimeSeries(dto)
    },
  }
}

export const userStatisticsService = createUserStatisticsService()
