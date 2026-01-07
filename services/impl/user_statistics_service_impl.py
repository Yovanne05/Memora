from dtos.user_statistics_dto import (
    ContentStatisticsDTO,
    ReviewStatisticsDTO,
    UserStatisticsDTO,
    UserStatisticsTimeSeriesDTO,
)
from repositorys import user_statistics_repository, review_repository
from services.interfaces.user_statistics_service_interface import (
    UserStatisticsServiceInterface,
)
from utils.enums import MetricEnum


class UserStatisticsService(UserStatisticsServiceInterface):
    def get_statistics(self, user_id: str) -> UserStatisticsDTO:
        notes_created = user_statistics_repository.get_notes_created_count(user_id)
        collections_created = (
            user_statistics_repository.get_collections_created_count(user_id)
        )
        flashcards_created = (
            user_statistics_repository.get_flashcards_created_count(user_id)
        )
        notes_shared = (
            user_statistics_repository.get_notes_shared_by_user_count(user_id)
        )
        collections_shared = (
            user_statistics_repository.get_collections_shared_by_user_count(user_id)
        )

        content_stats = ContentStatisticsDTO(
            notes_created=notes_created,
            collections_created=collections_created,
            flashcards_created=flashcards_created,
            notes_shared_by_user=notes_shared,
            collections_shared_by_user=collections_shared,
        )

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

    def get_timeseries(
        self, user_id: str, metric: MetricEnum, days: int
    ) -> UserStatisticsTimeSeriesDTO:
        """Get timeseries data for a specific metric."""
        if metric == MetricEnum.NOTES:
            points = user_statistics_repository.get_notes_created_timeseries(
                user_id, days
            )
        elif metric == MetricEnum.COLLECTIONS:
            points = user_statistics_repository.get_collections_created_timeseries(
                user_id, days
            )
        elif metric == MetricEnum.REVIEWS:
            points = user_statistics_repository.get_reviews_timeseries(user_id, days)
        else:
            points = []

        return UserStatisticsTimeSeriesDTO(metric=metric, days=days, points=points)


user_statistics_service = UserStatisticsService()
