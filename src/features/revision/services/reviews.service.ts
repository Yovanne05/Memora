import { httpClient } from '@/lib/http-client'
import type { ReviewDto, UpcomingReviewGroupDto } from '../dtos/review.dto'
import type {
  Review,
  ReviewCreateRequest,
  UpcomingReviewGroup,
} from '../models/review'
import {
  dtoToReview,
  toReviewCreateDto,
  dtoToUpcomingReviewGroup,
} from '../mappers/review.mapper'
import { reviewSchema, upcomingReviewsSchema } from '../schemas/review.schema'

export const reviewsService = {
  async submitReview(request: ReviewCreateRequest): Promise<Review> {
    const dto = toReviewCreateDto(request)
    const response = await httpClient.post<ReviewDto>('/reviews', dto)
    const validated = reviewSchema.parse(response)
    return dtoToReview(validated)
  },

  async getUpcomingReviews(): Promise<UpcomingReviewGroup[]> {
    const response = await httpClient.get<UpcomingReviewGroupDto[]>(
      '/reviews',
      {
        params: { status: 'upcoming' },
      }
    )
    const validated = upcomingReviewsSchema.parse(response)
    return validated.map(dtoToUpcomingReviewGroup)
  },
}
