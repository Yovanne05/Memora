from typing import Literal, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from repositorys.user_repository import UserSearchParams
from utils.enums import RoleEnum


class UserFindQuery(BaseModel):
    email: EmailStr | None = None
    username: Optional[str] = None
    username_contains: Optional[str] = Field(
        default=None, alias="usernameContains"
    )
    display_name_contains: Optional[str] = Field(
        default=None, alias="displayNameContains"
    )
    role: RoleEnum | None = None
    ids: Optional[list[UUID]] = None

    sort_by: Literal["email", "username", "created_at", "id"] = Field(
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

    def to_params(self) -> UserSearchParams:
        return UserSearchParams(
            email=self.email,
            username=self.username,
            username_contains=self.username_contains,
            display_name_contains=self.display_name_contains,
            role=self.role,
            ids=[str(item) for item in self.ids] if self.ids else None,
            sort_by=self.sort_by,
            sort_dir=self.sort_dir,
            limit=self.limit,
            offset=self.offset,
        )
