import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getContextualErrorMessage } from '@/lib/error-context'
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
        review.intervalDays === 1 ? '1 jour' : `${review.intervalDays} jours`

      if (review.isCorrect) {
        toast.success(`Correct ! Prochaine révision dans ${intervalText}`)
      } else {
        toast.error(`Incorrect. Prochaine révision dans ${intervalText}`)
      }

      logger.info('Review submitted successfully', {
        flashcardId: review.flashcardId,
        isCorrect: review.isCorrect,
        difficulty: review.difficulty,
        intervalDays: review.intervalDays,
      })
    },

    onError: (error) => {
      const message = getContextualErrorMessage(error, {
        operation: 'create',
        resource: 'flashcard',
        fallback: 'Échec de la soumission de la révision. Veuillez réessayer.',
      })
      toast.error(message)
      logger.error('Failed to submit review', error)
    },
  })
}
