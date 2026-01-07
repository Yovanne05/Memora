import { useQuery } from "@tanstack/react-query"
import { userStatisticsService } from "../services/statistics.service"

export function useUserStatisticsQuery() {
  return useQuery({
    queryKey: ["userStatistics", "me"],
    queryFn: () => userStatisticsService.getMyStatistics(),
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}
