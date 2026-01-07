import type { UserStatisticsDto } from "../dtos/user-statistics.dto"
import type { UserStatistics } from "../models/user-statistics.model"

export function dtoToUserStatistics(dto: UserStatisticsDto): UserStatistics {
  return {
    contentStatistics: dto.contentStatistics,
    reviewStatistics: dto.reviewStatistics ?? null,
  }
}
