from datetime import datetime
from typing import List, Literal
from pydantic import BaseModel, Field


class CollaboratorDTO(BaseModel):
    user_id: str
    username: str
    socket_id: str
    joined_at: datetime


class CollaborationSessionDTO(BaseModel):
    note_id: str
    collaborators: List[CollaboratorDTO] = Field(default_factory=list)
    active_users_count: int = 0
    content: str | None = None
    version: int = 0


class CollaborationOperationDTO(BaseModel):
    operation_type: Literal["insert", "delete", "replace"]
    position: int = Field(ge=0)
    content: str = ""
    length: int | None = Field(default=None, ge=0)
    version: int = Field(ge=0)


class CollaborationEventDTO(BaseModel):
    event_type: Literal[
        "user_joined",
        "user_left",
        "content_changed",
        "cursor_moved",
        "user_typing",
        "user_stopped_typing",
        "crdt_update",
        "crdt_sync_reply",
    ]
    user_id: str
    username: str
    note_id: str
    operation: CollaborationOperationDTO | None = None
    cursor_position: int | None = Field(default=None, ge=0)
    crdt_update: str | None = Field(default=None, description="Base64-encoded CRDT update")
    state_vector: str | None = Field(default=None, description="Base64-encoded state vector")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class JoinCollaborationDTO(BaseModel):
    note_id: str = Field(min_length=1, max_length=36)


class LeaveCollaborationDTO(BaseModel):
    note_id: str = Field(min_length=1, max_length=36)


class SendOperationDTO(BaseModel):
    note_id: str = Field(min_length=1, max_length=36)
    operation: CollaborationOperationDTO


class CRDTUpdateDTO(BaseModel):
    note_id: str = Field(min_length=1, max_length=36)
    update: str = Field(description="Base64-encoded CRDT update")


class CRDTSyncRequestDTO(BaseModel):
    note_id: str = Field(min_length=1, max_length=36)
    state_vector: str = Field(description="Base64-encoded state vector")


class CursorPositionDTO(BaseModel):
    note_id: str = Field(min_length=1, max_length=36)
    position: int = Field(ge=0)


class TypingStatusDTO(BaseModel):
    note_id: str = Field(min_length=1, max_length=36)
    is_typing: bool
