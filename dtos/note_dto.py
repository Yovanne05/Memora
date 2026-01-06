from datetime import datetime
from typing import List
from pydantic import BaseModel, ConfigDict, Field
from utils.enums import VisibilityEnum
from dtos.owner_dto import OwnerDTO


class NoteCreateDTO(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    content: str = Field(min_length=1)
    owner_id: str = Field(min_length=1, max_length=36)
    collection_id: str | None = Field(
        default=None, min_length=1, max_length=36
    )
    visibility: VisibilityEnum = VisibilityEnum.PRIVATE
    tags: List[str] = Field(default_factory=list)


class NoteUpdateDTO(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    content: str | None = Field(default=None, min_length=1)
    visibility: VisibilityEnum | None = None
    collection_id: str | None = Field(
        default=None, min_length=1, max_length=36
    )
    tags: List[str] | None = None


class NoteDTO(BaseModel):
    id: str
    title: str
    content: str
    visibility: VisibilityEnum
    owners: List[OwnerDTO] = Field(default_factory=list)
    collection_id: str | None = None
    collection_name: str | None = None
    tags: List[str] = Field(default_factory=list)
    is_favorite: bool = False
    user_permission: str | None = None  # "read", "write", "owner", or None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
