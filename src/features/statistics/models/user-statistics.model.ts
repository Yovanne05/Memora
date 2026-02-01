export type ReviewDifficulty = "again" | "hard" | "good" | "easy"

export type ReviewStatistics = {
  totalReviews: number
  reviewsLast7Days: number
  reviewsLast30Days: number
  averageQuality: number
  qualityDistribution: Partial<Record<ReviewDifficulty, number>>
}

export type ContentStatistics = {
  notesCreated: number
  collectionsCreated: number
  flashcardsCreated: number
  notesSharedByUser: number
  collectionsSharedByUser: number
}

export type UserStatistics = {
  contentStatistics: ContentStatistics
  reviewStatistics: ReviewStatistics | null
}
