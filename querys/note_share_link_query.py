from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from repositorys.note_share_link_repository import NoteShareLinkSearchParams


class NoteShareLinkFindQuery(BaseModel):
    note_id: Optional[UUID] = Field(default=None, alias="noteId")

    model_config = ConfigDict(populate_by_name=True)

    def to_params(self) -> NoteShareLinkSearchParams:
        return NoteShareLinkSearchParams(
            note_id=str(self.note_id) if self.note_id else None,
        )
