from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

from utils.enums import MetricEnum


class ContentStatisticsDTO(BaseModel):
    notes_created: int
    collections_created: int
    flashcards_created: int
    notes_shared_by_user: int
    collections_shared_by_user: int


class ReviewStatisticsDTO(BaseModel):
    total_reviews: int
    reviews_last_7_days: int
    reviews_last_30_days: int
    average_quality: float
    quality_distribution: dict[str, int]


class UserStatisticsDTO(BaseModel):
    content_statistics: ContentStatisticsDTO
    review_statistics: Optional[ReviewStatisticsDTO] = None


class TimeSeriesPointDTO(BaseModel):
    date: str
    value: int


class UserStatisticsTimeSeriesDTO(BaseModel):
    metric: MetricEnum
    days: int
    points: list[TimeSeriesPointDTO] = Field(default_factory=list)

    model_config = ConfigDict(use_enum_values=True)
