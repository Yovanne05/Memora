export const ReviewDifficulty = {
  AGAIN: 'again',
  HARD: 'hard',
  GOOD: 'good',
  EASY: 'easy',
} as const

export type ReviewDifficulty =
  (typeof ReviewDifficulty)[keyof typeof ReviewDifficulty]
