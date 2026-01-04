from dtos.user_statistics_dto import (
    ContentStatisticsDTO,
    UserStatisticsDTO,
)
from repositorys import user_statistics_repository
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

        return UserStatisticsDTO(
            content_statistics=content_stats, review_statistics=None
        )


user_statistics_service = UserStatisticsService()
