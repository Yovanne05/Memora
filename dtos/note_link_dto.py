from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class NoteLinkCreateDTO(BaseModel):
    linked_note_id: str = Field(min_length=1, max_length=36)
    label: str = Field(min_length=1, max_length=80)


class NoteLinkUpdateDTO(BaseModel):
    label: str = Field(min_length=1, max_length=80)


class NoteLinkDTO(BaseModel):
    note_id: str
    linked_note_id: str
    label: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
