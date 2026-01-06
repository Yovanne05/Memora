from typing import Protocol

from dtos.user_statistics_dto import UserStatisticsDTO


class UserStatisticsServiceInterface(Protocol):
    def get_statistics(self, user_id: str) -> UserStatisticsDTO:
        ...
