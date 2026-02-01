import type { UserStatisticsDto } from "../dtos/user-statistics.dto"
import type { UserStatistics } from "../models/user-statistics.model"

export function dtoToUserStatistics(dto: UserStatisticsDto): UserStatistics {
  const c = dto.content_statistics
  const r = dto.review_statistics

  return {
    contentStatistics: {
      notesCreated: c.notes_created,
      collectionsCreated: c.collections_created,
      flashcardsCreated: c.flashcards_created,
      notesSharedByUser: c.notes_shared_by_user,
      collectionsSharedByUser: c.collections_shared_by_user,
    },
    reviewStatistics: r
      ? {
          totalReviews: r.total_reviews,
          reviewsLast7Days: r.reviews_last_7_days,
          reviewsLast30Days: r.reviews_last_30_days,
          averageQuality: r.average_quality,
          qualityDistribution: r.quality_distribution ?? {},
        }
      : null,
  }
}