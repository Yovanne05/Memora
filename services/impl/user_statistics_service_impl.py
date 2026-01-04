from dtos.user_statistics_dto import (
    ContentStatisticsDTO,
    ReviewStatisticsDTO,
    UserStatisticsDTO,
)
from repositorys import user_statistics_repository, review_repository
from services.interfaces.user_statistics_service_interface import (
    UserStatisticsServiceInterface,
)


class UserStatisticsService(UserStatisticsServiceInterface):
    def get_statistics(self, user_id: str) -> UserStatisticsDTO:
        content_stats = ContentStatisticsDTO(
            notes_created=user_statistics_repository.get_notes_created_count(user_id),
            collections_created=user_statistics_repository.get_collections_created_count(
                user_id
            ),
            flashcards_created=user_statistics_repository.get_flashcards_created_count(
                user_id
            ),
            notes_shared_by_user=user_statistics_repository.get_notes_shared_by_user_count(
                user_id
            ),
            collections_shared_by_user=user_statistics_repository.get_collections_shared_by_user_count(
                user_id
            ),
        )

        # Récupérer les statistiques de reviews
        review_stats_data = review_repository.get_review_statistics(user_id)

        review_stats = ReviewStatisticsDTO(
            total_reviews=review_stats_data.total_reviews,
            reviews_last_7_days=review_stats_data.reviews_last_7_days,
            reviews_last_30_days=review_stats_data.reviews_last_30_days,
            average_quality=review_stats_data.average_quality,
            quality_distribution=review_stats_data.quality_distribution,
        )

        return UserStatisticsDTO(
            content_statistics=content_stats, review_statistics=review_stats
        )


user_statistics_service = UserStatisticsService()
