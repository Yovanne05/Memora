import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { reviewsService } from '../services/reviews.service'
import type { ReviewCreateRequest } from '../models/review'
import { REVIEWS_QUERY_KEYS } from './useUpcomingReviewsQuery'
import { logger } from '@/lib/logger'

export function useReviewMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: ReviewCreateRequest) =>
      reviewsService.submitReview(request),

    onSuccess: (review) => {
      // Invalidate upcoming reviews to refresh the list
      queryClient.invalidateQueries({
        queryKey: REVIEWS_QUERY_KEYS.upcoming(),
      })

      // Show success toast based on correctness
      const intervalText =
        review.intervalDays === 1 ? '1 day' : `${review.intervalDays} days`

      if (review.isCorrect) {
        toast.success(`✅ Correct! Next review in ${intervalText}`)
      } else {
        toast.error(`❌ Incorrect. Next review in ${intervalText}`)
      }

      logger.info('Review submitted successfully', {
        flashcardId: review.flashcardId,
        isCorrect: review.isCorrect,
        difficulty: review.difficulty,
        intervalDays: review.intervalDays,
      })
    },

    onError: (error) => {
      toast.error('Failed to submit review. Please try again.')
      logger.error('Failed to submit review', error)
    },
  })
}
