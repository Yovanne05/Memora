from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field

from repositorys.collection_share_link_repository import CollectionShareLinkSearchParams


class CollectionShareLinkFindQuery(BaseModel):
    collection_id: Optional[UUID] = Field(default=None)

    def to_params(self) -> CollectionShareLinkSearchParams:
        return CollectionShareLinkSearchParams(
            collection_id=str(self.collection_id) if self.collection_id else None,
        )
