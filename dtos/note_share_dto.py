from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from utils.enums import SharePermissionEnum


class NoteShareCreateDTO(BaseModel):
    user_id: str = Field(min_length=1, max_length=36)
    permission: SharePermissionEnum = SharePermissionEnum.READ


class NoteShareUpdateDTO(BaseModel):
    permission: SharePermissionEnum


class NoteShareDTO(BaseModel):
    note_id: str
    user_id: str
    permission: SharePermissionEnum
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
