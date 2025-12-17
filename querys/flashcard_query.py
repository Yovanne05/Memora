from typing import Literal, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from repositorys.flashcard_repository import FlashcardSearchParams


class FlashcardFindQuery(BaseModel):
    note_id: Optional[UUID] = Field(default=None, alias="noteId")
    question_contains: Optional[str] = Field(
        default=None, alias="questionContains"
    )

    sort_by: Literal["question", "created_at", "updated_at"] = Field(
        default="created_at", alias="sortBy"
    )
    sort_dir: Literal["asc", "desc"] = Field(default="desc", alias="sortDir")

    limit: int = Field(default=50, ge=1, le=200)
    offset: int = Field(default=0, ge=0, le=10_000)

    model_config = ConfigDict(populate_by_name=True)

    def to_params(self) -> FlashcardSearchParams:
        return FlashcardSearchParams(
            note_id=str(self.note_id) if self.note_id else None,
            question_contains=self.question_contains,
            sort_by=self.sort_by,
            sort_dir=self.sort_dir,
            limit=self.limit,
            offset=self.offset,
        )
