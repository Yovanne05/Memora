import { z } from 'zod'

export const reviewDifficultySchema = z.enum(['again', 'hard', 'good', 'easy'])

export const reviewSchema = z.object({
  user_id: z.uuid(),
  flashcard_id: z.uuid(),
  selected_answer_id: z.uuid(),
  is_correct: z.boolean(),
  correct_answer_id: z.uuid(),
  difficulty: reviewDifficultySchema,
  e_factor: z.union([z.number(), z.string().transform(Number)]),
  repetitions: z.number().int().nonnegative(),
  interval_days: z.number().int().nonnegative(),
  next_review_at: z.string(),
  reviewed_at: z.string(),
})

export const reviewCreateSchema = z.object({
  flashcard_id: z.uuid(),
  selected_answer_id: z.uuid(),
  difficulty: reviewDifficultySchema,
})

export const flashcardReviewItemSchema = z.object({
  flashcard_id: z.uuid(),
  question: z.string(),
  next_review_at: z.string(),
})

export const upcomingReviewGroupSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  flashcards: z.array(flashcardReviewItemSchema),
})

export const upcomingReviewsSchema = z.array(upcomingReviewGroupSchema)
