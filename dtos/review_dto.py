from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from utils.enums import ReviewDifficultyEnum


class ReviewCreateDTO(BaseModel):
    flashcard_id: str
    selected_answer_id: str
    difficulty: ReviewDifficultyEnum


class ReviewDTO(BaseModel):
    user_id: str
    flashcard_id: str
    selected_answer_id: str
    is_correct: bool
    correct_answer_id: str
    difficulty: ReviewDifficultyEnum
    e_factor: Decimal
    repetitions: int
    interval_days: int
    next_review_at: datetime
    reviewed_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FlashcardWithReviewDTO(BaseModel):
    flashcard_id: str
    question: str
    next_review_at: datetime

    model_config = ConfigDict(ser_json_timedelta='iso8601')


class UpcomingReviewsGroupDTO(BaseModel):
    date: str
    flashcards: list[FlashcardWithReviewDTO]
