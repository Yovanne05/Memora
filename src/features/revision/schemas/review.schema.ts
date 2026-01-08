import { z } from 'zod'

export const reviewDifficultySchema = z.enum(['again', 'hard', 'good', 'easy'])

export const reviewSchema = z.object({
  user_id: z.string().uuid(),
  flashcard_id: z.string().uuid(),
  selected_answer_id: z.string().uuid(),
  is_correct: z.boolean(),
  correct_answer_id: z.string().uuid(),
  difficulty: reviewDifficultySchema,
  e_factor: z.number(),
  repetitions: z.number().int().nonnegative(),
  interval_days: z.number().int().nonnegative(),
  next_review_at: z.string().datetime(),
  reviewed_at: z.string().datetime(),
})

export const reviewCreateSchema = z.object({
  flashcard_id: z.string().uuid(),
  selected_answer_id: z.string().uuid(),
  difficulty: reviewDifficultySchema,
})

export const flashcardReviewItemSchema = z.object({
  flashcard_id: z.string().uuid(),
  question: z.string(),
  next_review_at: z.string().datetime(),
})

export const upcomingReviewGroupSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  flashcards: z.array(flashcardReviewItemSchema),
})

export const upcomingReviewsSchema = z.array(upcomingReviewGroupSchema)
