from datetime import datetime
from typing import List, Literal
from pydantic import BaseModel, Field


class CollaboratorDTO(BaseModel):
    """Represents a user currently editing a note."""

    user_id: str
    username: str
    socket_id: str
    joined_at: datetime


class CollaborationSessionDTO(BaseModel):
    """Represents an active collaboration session."""

    note_id: str
    collaborators: List[CollaboratorDTO] = Field(default_factory=list)
    active_users_count: int = 0
    content: str | None = None
    version: int = 0


class CollaborationOperationDTO(BaseModel):
    """Represents a collaborative editing operation."""

    operation_type: Literal["insert", "delete", "replace"]
    position: int = Field(ge=0)
    content: str = ""
    length: int | None = Field(default=None, ge=0)
    version: int = Field(ge=0)


class CollaborationEventDTO(BaseModel):
    """Represents a collaboration event sent via WebSocket."""

    event_type: Literal[
        "user_joined",
        "user_left",
        "content_changed",
        "cursor_moved",
        "user_typing",
        "user_stopped_typing",
    ]
    user_id: str
    username: str
    note_id: str
    operation: CollaborationOperationDTO | None = None
    cursor_position: int | None = Field(default=None, ge=0)
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class JoinCollaborationDTO(BaseModel):
    """Request DTO for joining a collaboration session."""

    note_id: str = Field(min_length=1, max_length=36)


class LeaveCollaborationDTO(BaseModel):
    """Request DTO for leaving a collaboration session."""

    note_id: str = Field(min_length=1, max_length=36)


class SendOperationDTO(BaseModel):
    """Request DTO for sending a collaboration operation."""

    note_id: str = Field(min_length=1, max_length=36)
    operation: CollaborationOperationDTO


class CursorPositionDTO(BaseModel):
    """Request DTO for updating cursor position."""

    note_id: str = Field(min_length=1, max_length=36)
    position: int = Field(ge=0)


class TypingStatusDTO(BaseModel):
    """Request DTO for updating typing status."""

    note_id: str = Field(min_length=1, max_length=36)
    is_typing: bool
