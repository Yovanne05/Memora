from datetime import datetime

from pydantic import BaseModel, ConfigDict

from utils.enums import SharePermissionEnum


class NoteShareLinkCreateDTO(BaseModel):
    permission: SharePermissionEnum = SharePermissionEnum.READ


class NoteShareLinkDTO(BaseModel):
    id: str
    note_id: str
    permission: SharePermissionEnum
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
