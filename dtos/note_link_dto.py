from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class NoteLinkCreateDTO(BaseModel):
    linked_note_id: str = Field(
        min_length=1, max_length=36, alias="linkedNoteId"
    )

    model_config = ConfigDict(populate_by_name=True)


class NoteLinkDTO(BaseModel):
    note_id: str
    linked_note_id: str = Field(alias="linkedNoteId")
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True, populate_by_name=True
    )
