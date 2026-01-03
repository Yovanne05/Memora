from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from dtos.flashcard_answer_dto import FlashcardAnswerCreateDTO, FlashcardAnswerDTO
from utils.enums import DifficultyEnum


class FlashcardCreateDTO(BaseModel):
    question: str = Field(min_length=1)
    answers: list[FlashcardAnswerCreateDTO] = Field(min_length=1)
    difficulty: DifficultyEnum | None = Field(default=None)


class FlashcardUpdateDTO(BaseModel):
    question: str | None = Field(default=None, min_length=1)
    answers: list[FlashcardAnswerCreateDTO] | None = Field(
        default=None, min_length=1
    )
    difficulty: DifficultyEnum | None = Field(default=None)


class FlashcardDTO(BaseModel):
    id: str
    note_id: str
    question: str
    difficulty: DifficultyEnum | None
    answers: list[FlashcardAnswerDTO]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
