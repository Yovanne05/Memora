import { useQuery } from '@tanstack/react-query'
import { reviewsService } from '../services/reviews.service'

export const REVIEWS_QUERY_KEYS = {
  all: ['reviews'] as const,
  upcoming: () => [...REVIEWS_QUERY_KEYS.all, 'upcoming'] as const,
}

export function useUpcomingReviewsQuery() {
  return useQuery({
    queryKey: REVIEWS_QUERY_KEYS.upcoming(),
    queryFn: () => reviewsService.getUpcomingReviews(),
    staleTime: 30_000, // 30 seconds
  })
}
