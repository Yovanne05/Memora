from typing import Literal, Optional
from uuid import UUID
from pydantic import BaseModel, Field, field_validator
from repositorys.note_repository import NoteSearchParams
from utils.enums import VisibilityEnum


class NoteFindQuery(BaseModel):
    owner_id: Optional[UUID] = Field(default=None)
    collection_id: Optional[UUID] = Field(default=None)
    shared_with_user_id: Optional[UUID] = Field(default=None)
    visibility: VisibilityEnum | None = None
    title_contains: Optional[str] = Field(default=None)
    ids: Optional[list[UUID]] = None
    tags: Optional[list[str]] = None
    is_favorite: Optional[bool] = Field(default=None)
    include_public: bool = Field(default=False)

    sort_by: Literal["title", "created_at", "updated_at"] = Field(
        default="created_at"
    )
    sort_dir: Literal["asc", "desc"] = Field(default="desc")

    limit: int = Field(default=50, ge=1, le=200)
    offset: int = Field(default=0, ge=0, le=10_000)

    @field_validator("ids", "tags", mode="before")
    @classmethod
    def parse_csv(cls, value):
        if value is None:
            return value
        if isinstance(value, str):
            return [part.strip() for part in value.split(",") if part.strip()]
        return value

    def to_params(self) -> NoteSearchParams:
        return NoteSearchParams(
            owner_id=None,
            collection_id=str(self.collection_id)
            if self.collection_id
            else None,
            shared_with_user_id=None,
            visibility=self.visibility,
            title_contains=self.title_contains,
            ids=[str(item) for item in self.ids] if self.ids else None,
            tags=self.tags,
            is_favorite=self.is_favorite,
            include_public=self.include_public,
            sort_by=self.sort_by,
            sort_dir=self.sort_dir,
            limit=self.limit,
            offset=self.offset,
        )
