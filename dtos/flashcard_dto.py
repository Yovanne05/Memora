from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from dtos.flashcard_answer_dto import FlashcardAnswerCreateDTO, FlashcardAnswerDTO


class FlashcardCreateDTO(BaseModel):
    question: str = Field(min_length=1)
    answers: list[FlashcardAnswerCreateDTO] = Field(min_length=1)


class FlashcardUpdateDTO(BaseModel):
    question: str | None = Field(default=None, min_length=1)
    answers: list[FlashcardAnswerCreateDTO] | None = Field(
        default=None, min_length=1
    )


class FlashcardDTO(BaseModel):
    id: str
    note_id: str
    question: str
    answers: list[FlashcardAnswerDTO]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
