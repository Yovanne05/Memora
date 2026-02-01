import { useQuery } from "@tanstack/react-query"
import type { StatisticsMetric, StatisticsRangeDays } from "../types/statistics-types"
import { userStatisticsService } from "../services/statistics.service"

export function useUserStatisticsTimeseriesQuery(metric: StatisticsMetric, days: StatisticsRangeDays, enabled = true) {
  return useQuery({
    queryKey: ["userStatistics", "timeseries", metric, days],
    queryFn: () => userStatisticsService.getMyTimeSeries(metric, days),
    enabled,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}
