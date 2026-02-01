import { ReviewDifficulty } from '../types/difficulty'

export interface Review {
  userId: string
  flashcardId: string
  selectedAnswerId: string
  isCorrect: boolean
  correctAnswerId: string
  difficulty: ReviewDifficulty
  eFactor: number
  repetitions: number
  intervalDays: number
  nextReviewAt: Date
  reviewedAt: Date
}

export interface FlashcardReviewItem {
  flashcardId: string
  question: string
  nextReviewAt: Date
}

export interface UpcomingReviewGroup {
  date: string // ISO date format (YYYY-MM-DD)
  flashcards: FlashcardReviewItem[]
}

export interface ReviewCreateRequest {
  flashcardId: string
  selectedAnswerId: string
  difficulty: ReviewDifficulty
}
