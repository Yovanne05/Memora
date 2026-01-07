export type ReviewDifficulty = "again" | "hard" | "good" | "easy"

export type UserStatisticsDto = {
  contentStatistics: {
    notesCreated: number
    collectionsCreated: number
    flashcardsCreated: number
    notesSharedByUser: number
    collectionsSharedByUser: number
  }
  reviewStatistics: {
    totalReviews: number
    reviewsLast7Days: number
    reviewsLast30Days: number
    averageQuality: number
    qualityDistribution: Partial<Record<ReviewDifficulty, number>>
  } | null
}
