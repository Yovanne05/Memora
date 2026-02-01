from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from utils.enums import SharePermissionEnum
from dtos.user_dto import UserDTO


class CollectionShareCreateDTO(BaseModel):
    user_id: str = Field(min_length=1, max_length=36)
    permission: SharePermissionEnum = SharePermissionEnum.READ


class CollectionShareUpdateDTO(BaseModel):
    permission: SharePermissionEnum


class CollectionShareDTO(BaseModel):
    collection_id: str
    user: UserDTO
    permission: SharePermissionEnum
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
