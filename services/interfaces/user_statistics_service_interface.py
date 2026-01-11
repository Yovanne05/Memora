from typing import Protocol

from dtos.user_statistics_dto import UserStatisticsDTO, UserStatisticsTimeSeriesDTO
from utils.enums import MetricEnum


class UserStatisticsServiceInterface(Protocol):
    def get_statistics(self, user_id: str) -> UserStatisticsDTO:
        ...

    def get_timeseries(
        self, user_id: str, metric: MetricEnum, days: int
    ) -> UserStatisticsTimeSeriesDTO:
        ...
