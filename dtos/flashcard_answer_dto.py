from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class FlashcardAnswerCreateDTO(BaseModel):
    answer_text: str = Field(min_length=1)
    is_correct: bool


class FlashcardAnswerDTO(BaseModel):
    id: str
    flashcard_id: str
    answer_text: str
    is_correct: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
