from typing import Literal, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from repositorys.tag_repository import TagSearchParams


class TagFindQuery(BaseModel):
    name: Optional[str] = None
    name_contains: Optional[str] = Field(default=None, alias="nameContains")
    ids: Optional[list[UUID]] = None

    sort_by: Literal["name", "created_at", "id"] = Field(
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

    def to_params(self) -> TagSearchParams:
        return TagSearchParams(
            name=self.name,
            name_contains=self.name_contains,
            ids=[str(item) for item in self.ids] if self.ids else None,
            sort_by=self.sort_by,
            sort_dir=self.sort_dir,
            limit=self.limit,
            offset=self.offset,
        )
