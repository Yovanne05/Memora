import { httpClient, type HttpClient } from "@/lib/http-client"
import type { UserStatisticsDto } from "../dtos/user-statistics.dto"
import type { UserStatisticsTimeSeriesDto } from "../dtos/user-statistics-timeseries.dto"
import { dtoToUserStatistics } from "../mappers/user-statistics.mapper"
import type { UserStatisticsTimeSeries } from "../models/user-statistics-timeseries.model"
import type { IUserStatisticsService } from "./statistics.service.interface"
import type { StatisticsMetric, StatisticsRangeDays } from "../types/statistics-types"

export function createUserStatisticsService(
  client: HttpClient = httpClient
): IUserStatisticsService {
  return {
    async getMyStatistics() {
      const dto = await client.get<UserStatisticsDto>("/users/me/statistics")
      return dtoToUserStatistics(dto)
    },

    async getMyTimeSeries(metric: StatisticsMetric, days: StatisticsRangeDays): Promise<UserStatisticsTimeSeries> {
      const dto = await client.get<UserStatisticsTimeSeriesDto>("/users/me/statistics/timeseries", {
        params: { metric, days },
      })
      return dto
    },
  }
}

export const userStatisticsService = createUserStatisticsService()
export type { IUserStatisticsService as UserStatisticsService } from "./statistics.service.interface"