from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from utils.enums import VisibilityEnum


class NoteCreateDTO(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    content: str = Field(min_length=1)
    owner_id: str = Field(min_length=1, max_length=36)
    collection_id: str | None = Field(
        default=None, min_length=1, max_length=36
    )
    visibility: VisibilityEnum = VisibilityEnum.PRIVATE


class NoteUpdateDTO(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    content: str | None = Field(default=None, min_length=1)
    visibility: VisibilityEnum | None = None
    collection_id: str | None = Field(
        default=None, min_length=1, max_length=36
    )


class NoteDTO(BaseModel):
    id: str
    title: str
    content: str
    visibility: VisibilityEnum
    owner_id: str
    collection_id: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
