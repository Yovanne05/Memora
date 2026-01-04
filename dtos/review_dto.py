from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from utils.enums import ReviewDifficultyEnum


class ReviewCreateDTO(BaseModel):
    flashcard_id: str = Field(alias="flashcardId")
    selected_answer_id: str = Field(alias="selectedAnswerId")
    difficulty: ReviewDifficultyEnum

    model_config = ConfigDict(populate_by_name=True)


class ReviewDTO(BaseModel):
    user_id: str
    flashcard_id: str
    selected_answer_id: str
    is_correct: bool
    difficulty: ReviewDifficultyEnum
    e_factor: Decimal
    repetitions: int
    interval_days: int
    next_review_at: datetime
    reviewed_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FlashcardWithReviewDTO(BaseModel):
    flashcard_id: str = Field(alias="flashcardId")
    question: str
    next_review_at: datetime = Field(alias="nextReviewAt")

    model_config = ConfigDict(populate_by_name=True, ser_json_timedelta='iso8601')


class UpcomingReviewsGroupDTO(BaseModel):
    date: str
    flashcards: list[FlashcardWithReviewDTO]

    model_config = ConfigDict(populate_by_name=True)
