import type {
  ReviewDto,
  ReviewCreateDto,
  FlashcardReviewItemDto,
  UpcomingReviewGroupDto,
} from '../dtos/review.dto'
import type {
  Review,
  ReviewCreateRequest,
  FlashcardReviewItem,
  UpcomingReviewGroup,
} from '../models/review'
import type { ReviewDifficulty } from '../types/difficulty'

export function dtoToReview(dto: ReviewDto): Review {
  return {
    userId: dto.user_id,
    flashcardId: dto.flashcard_id,
    selectedAnswerId: dto.selected_answer_id,
    isCorrect: dto.is_correct,
    correctAnswerId: dto.correct_answer_id,
    difficulty: dto.difficulty as ReviewDifficulty,
    eFactor: dto.e_factor,
    repetitions: dto.repetitions,
    intervalDays: dto.interval_days,
    nextReviewAt: new Date(dto.next_review_at),
    reviewedAt: new Date(dto.reviewed_at),
  }
}

export function toReviewCreateDto(
  request: ReviewCreateRequest
): ReviewCreateDto {
  return {
    flashcard_id: request.flashcardId,
    selected_answer_id: request.selectedAnswerId,
    difficulty: request.difficulty,
  }
}

export function dtoToFlashcardReviewItem(
  dto: FlashcardReviewItemDto
): FlashcardReviewItem {
  return {
    flashcardId: dto.flashcard_id,
    question: dto.question,
    nextReviewAt: new Date(dto.next_review_at),
  }
}

export function dtoToUpcomingReviewGroup(
  dto: UpcomingReviewGroupDto
): UpcomingReviewGroup {
  return {
    date: dto.date,
    flashcards: dto.flashcards.map(dtoToFlashcardReviewItem),
  }
}
