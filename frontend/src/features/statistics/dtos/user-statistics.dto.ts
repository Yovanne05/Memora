export type ReviewDifficulty = "again" | "hard" | "good" | "easy"

export type UserStatisticsDto = {
  content_statistics: {
    notes_created: number
    collections_created: number
    flashcards_created: number
    notes_shared_by_user: number
    collections_shared_by_user: number
  }
  review_statistics: {
    total_reviews: number
    reviews_last_7_days: number
    reviews_last_30_days: number
    average_quality: number
    quality_distribution: Partial<Record<ReviewDifficulty, number>>
  } | null
}