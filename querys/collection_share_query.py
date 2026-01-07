from typing import Literal, Optional
from uuid import UUID

from pydantic import BaseModel, Field

from repositorys.collection_share_repository import CollectionShareSearchParams


class CollectionShareFindQuery(BaseModel):
    collection_id: Optional[UUID] = Field(default=None)
    user_id: Optional[UUID] = Field(default=None)

    sort_by: Literal["created_at"] = Field(default="created_at")
    sort_dir: Literal["asc", "desc"] = Field(default="desc")

    limit: int = Field(default=50, ge=1, le=200)
    offset: int = Field(default=0, ge=0, le=10_000)

    def to_params(self) -> CollectionShareSearchParams:
        return CollectionShareSearchParams(
            collection_id=str(self.collection_id) if self.collection_id else None,
            user_id=str(self.user_id) if self.user_id else None,
            sort_by=self.sort_by,
            sort_dir=self.sort_dir,
            limit=self.limit,
            offset=self.offset,
        )
