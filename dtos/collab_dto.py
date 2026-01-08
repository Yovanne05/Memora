from typing import List, Optional

from pydantic import BaseModel, Field


class CollabSessionCreateDTO(BaseModel):
    note_id: str = Field(min_length=1, max_length=36)


class CollabSessionVerifyDTO(BaseModel):
    collab_token: str = Field(min_length=1)
    note_id: str = Field(min_length=1, max_length=36)


class CollabDocumentUpdateDTO(BaseModel):
    yjs_snapshot: str = Field(min_length=1)
    prose_mirror_json: Optional[str] = Field(default=None)


class CollabSessionResponseDTO(BaseModel):
    collab_token: str = Field(min_length=1)
    scope: List[str]
    expires_in: int


class CollabSessionVerifyResponseDTO(BaseModel):
    user_id: str = Field(min_length=1)
    scope: List[str]


class CollabDocumentResponseDTO(BaseModel):
    note_id: str = Field(min_length=1)
    yjs_snapshot: Optional[str] = Field(default=None)
    prose_mirror_json: Optional[str] = Field(default=None)
