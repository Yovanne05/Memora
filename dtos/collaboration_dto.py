from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field


class CollaboratorDTO(BaseModel):
    user_id: str
    username: str
    socket_id: str
    joined_at: datetime


class CollaborationSessionDTO(BaseModel):
    note_id: str
    collaborators: list[CollaboratorDTO] = Field(default_factory=list)
    active_users_count: int = 0


class CollaborationEventDTO(BaseModel):
    event_type: Literal[
        "user_joined",
        "user_left",
        "crdt_update",
    ]
    user_id: str
    username: str
    note_id: str
    crdt_update: str | None = Field(
        default=None, description="Base64-encoded CRDT update"
    )
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class CRDTUpdateDTO(BaseModel):
    note_id: str = Field(min_length=1, max_length=36)
    update: str = Field(description="Base64-encoded CRDT update")


class CRDTSyncRequestDTO(BaseModel):
    note_id: str = Field(min_length=1, max_length=36)
    state_vector: str = Field(description="Base64-encoded state vector")
