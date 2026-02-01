from datetime import datetime

from pydantic import BaseModel, ConfigDict

from utils.enums import SharePermissionEnum


class CollectionShareLinkCreateDTO(BaseModel):
    permission: SharePermissionEnum = SharePermissionEnum.READ


class CollectionShareLinkDTO(BaseModel):
    id: str
    collection_id: str
    permission: SharePermissionEnum
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
