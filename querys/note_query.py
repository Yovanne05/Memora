from typing import Literal, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, field_validator
from repositorys.note_repository import NoteSearchParams
from utils.enums import VisibilityEnum


class NoteFindQuery(BaseModel):
    owner_id: Optional[UUID] = Field(default=None, alias="ownerId")
    collection_id: Optional[UUID] = Field(default=None, alias="collectionId")
    visibility: VisibilityEnum | None = None
    title_contains: Optional[str] = Field(default=None, alias="titleContains")
    content_contains: Optional[str] = Field(
        default=None, alias="contentContains"
    )
    ids: Optional[list[UUID]] = None

    sort_by: Literal["title", "created_at", "updated_at"] = Field(
        default="created_at", alias="sortBy"
    )
    sort_dir: Literal["asc", "desc"] = Field(default="desc", alias="sortDir")

    limit: int = Field(default=50, ge=1, le=200)
    offset: int = Field(default=0, ge=0, le=10_000)

    model_config = ConfigDict(populate_by_name=True)

    @field_validator("ids", mode="before")
    @classmethod
    def parse_ids_csv(cls, value):
        if value is None:
            return value
        if isinstance(value, str):
            return [part.strip() for part in value.split(",") if part.strip()]
        return value

    def to_params(self) -> NoteSearchParams:
        return NoteSearchParams(
            owner_id=str(self.owner_id) if self.owner_id else None,
            collection_id=str(self.collection_id)
            if self.collection_id
            else None,
            visibility=self.visibility,
            title_contains=self.title_contains,
            content_contains=self.content_contains,
            ids=[str(item) for item in self.ids] if self.ids else None,
            sort_by=self.sort_by,
            sort_dir=self.sort_dir,
            limit=self.limit,
            offset=self.offset,
        )
