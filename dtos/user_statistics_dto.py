from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class ContentStatisticsDTO(BaseModel):
    notes_created: int = Field(alias="notesCreated")
    collections_created: int = Field(alias="collectionsCreated")
    flashcards_created: int = Field(alias="flashcardsCreated")
    notes_shared_by_user: int = Field(alias="notesSharedByUser")
    collections_shared_by_user: int = Field(alias="collectionsSharedByUser")

    model_config = ConfigDict(populate_by_name=True)


class ReviewStatisticsDTO(BaseModel):
    total_reviews: int = Field(alias="totalReviews")
    reviews_last_7_days: int = Field(alias="reviewsLast7Days")
    reviews_last_30_days: int = Field(alias="reviewsLast30Days")
    average_quality: float = Field(alias="averageQuality")
    quality_distribution: dict[str, int] = Field(alias="qualityDistribution")

    model_config = ConfigDict(populate_by_name=True)


class UserStatisticsDTO(BaseModel):
    content_statistics: ContentStatisticsDTO = Field(alias="contentStatistics")
    review_statistics: Optional[ReviewStatisticsDTO] = Field(
        default=None, alias="reviewStatistics"
    )

    model_config = ConfigDict(populate_by_name=True)
