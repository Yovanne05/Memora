export interface ReviewDto {
  user_id: string
  flashcard_id: string
  selected_answer_id: string
  is_correct: boolean
  correct_answer_id: string
  difficulty: string
  e_factor: number
  repetitions: number
  interval_days: number
  next_review_at: string // ISO datetime
  reviewed_at: string // ISO datetime
}

export interface ReviewCreateDto {
  flashcard_id: string
  selected_answer_id: string
  difficulty: string
}

export interface FlashcardReviewItemDto {
  flashcard_id: string
  question: string
  next_review_at: string // ISO datetime
}

export interface UpcomingReviewGroupDto {
  date: string // ISO date (YYYY-MM-DD)
  flashcards: FlashcardReviewItemDto[]
}
