from datetime import datetime
from typing import List
from pydantic import BaseModel, ConfigDict, Field
from utils.enums import VisibilityEnum
from dtos.user_access_dto import UserAccessDTO


class NoteCreateDTO(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    owner_id: str = Field(min_length=1, max_length=36)

    yjs_snapshot: str | None = None

    collection_id: str | None = Field(default=None, min_length=1, max_length=36)
    visibility: VisibilityEnum = VisibilityEnum.PRIVATE
    tags: List[str] = Field(default_factory=list)


class NoteUpdateDTO(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    visibility: VisibilityEnum | None = None
    collection_id: str | None = Field(default=None, min_length=1, max_length=36)
    tags: List[str] | None = None

    yjs_snapshot: str | None = None


class NoteDTO(BaseModel):
    id: str
    owner_id: str
    owner_username: str
    title: str
    visibility: VisibilityEnum
    user_access: List[UserAccessDTO] = Field(default_factory=list)
    collection_id: str | None = None
    collection_name: str | None = None
    tags: List[str] = Field(default_factory=list)
    is_favorite: bool = False
    created_at: datetime
    updated_at: datetime
    yjs_snapshot: str | None = None

    model_config = ConfigDict(from_attributes=True)
