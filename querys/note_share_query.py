from typing import Literal, Optional
from uuid import UUID

from pydantic import BaseModel, Field

from repositorys.note_share_repository import NoteShareSearchParams


class NoteShareFindQuery(BaseModel):
    note_id: Optional[UUID] = Field(default=None)
    user_id: Optional[UUID] = Field(default=None)

    sort_by: Literal["created_at"] = Field(default="created_at")
    sort_dir: Literal["asc", "desc"] = Field(default="desc")

    limit: int = Field(default=50, ge=1, le=200)
    offset: int = Field(default=0, ge=0, le=10_000)

    def to_params(self) -> NoteShareSearchParams:
        return NoteShareSearchParams(
            note_id=str(self.note_id) if self.note_id else None,
            user_id=str(self.user_id) if self.user_id else None,
            sort_by=self.sort_by,
            sort_dir=self.sort_dir,
            limit=self.limit,
            offset=self.offset,
        )
