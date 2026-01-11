from pydantic import BaseModel, Field, field_validator
from repositorys.collection_repository import CollectionSearchParams
from typing import Literal, Optional
from utils.enums import VisibilityEnum
from uuid import UUID


class CollectionFindQuery(BaseModel) :
    owner_id : Optional[UUID] = Field(default=None)
    shared_with_user_id: Optional[UUID] = Field(default=None)
    visibility : VisibilityEnum | None = None
    title_contains : Optional[str] = Field(default = None)
    ids : Optional[list[UUID]] = None
    tags : Optional[list[str]] = None
    only_with_notes : bool = Field(default = False)
    is_favorite: bool = Field(default=False)

    sort_by : Literal["title", "created_at", "updated_at"] = Field(
        default = "created_at"
    )
    sort_dir : Literal["asc", "desc"] = Field(default = "desc")

    limit : int = Field(default = 50, ge = 1, le = 200)
    offset : int = Field(default = 0, ge = 0, le = 10_000)

    @field_validator("ids", "tags", mode = "before")
    def parse_csv(cls, value) :
        if value is None :
            return value
        if isinstance(value, str) :
            return [part.strip() for part in value.split(",") if part.strip()]
        return value

    def to_params(self) -> CollectionSearchParams :
        return CollectionSearchParams(
            owner_id = None,
            shared_with_user_id=None,
            visibility = self.visibility,
            title_contains = self.title_contains,
            only_with_notes = self.only_with_notes,
            ids = [str(item) for item in self.ids] if self.ids else None,
            tags=self.tags,
            is_favorite=self.is_favorite,
            sort_by = self.sort_by,
            sort_dir = self.sort_dir,
            limit = self.limit,
            offset = self.offset,
        )
