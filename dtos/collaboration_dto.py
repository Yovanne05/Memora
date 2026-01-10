import base64
import re
from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field, field_validator, ValidationError


class CollaboratorDTO(BaseModel):
    user_id: str
    username: str
    socket_id: str


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
    note_id: str = Field(
        min_length=1,
        max_length=36,
        description="UUID of the note (36 chars max including hyphens)"
    )
    update: str = Field(
        description="Base64-encoded CRDT update",
        min_length=1,
        max_length=1048576,  # 1MB max payload (base64 encoded)
    )

    @field_validator("note_id")
    @classmethod
    def validate_note_id_format(cls, v: str) -> str:
        uuid_pattern = re.compile(
            r'^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$',
            re.IGNORECASE
        )

        if not uuid_pattern.match(v):
            raise ValueError(
                f"Invalid note_id format. Expected UUID, got: {v[:50]}"
            )

        return v

    @field_validator("update")
    @classmethod
    def validate_base64_format(cls, v: str) -> str:
        try:
            decoded = base64.b64decode(v, validate=True)
            if len(decoded) > 2097152:  # 2MB max decoded size
                raise ValueError(
                    f"Decoded CRDT update too large: {len(decoded)} bytes (max 2MB)"
                )

        except Exception as e:
            raise ValueError(
                f"Invalid base64 encoding in CRDT update: {str(e)}"
            )

        return v


class CRDTSyncRequestDTO(BaseModel):
    note_id: str = Field(
        min_length=1,
        max_length=36,
        description="UUID of the note (36 chars max including hyphens)"
    )
    state_vector: str = Field(
        description="Base64-encoded state vector",
        min_length=1,
        max_length=65536,  # 64KB max for state vector
    )

    @field_validator("note_id")
    @classmethod
    def validate_note_id_format(cls, v: str) -> str:
        uuid_pattern = re.compile(
            r'^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$',
            re.IGNORECASE
        )

        if not uuid_pattern.match(v):
            raise ValueError(
                f"Invalid note_id format. Expected UUID, got: {v[:50]}"
            )

        return v

    @field_validator("state_vector")
    @classmethod
    def validate_state_vector_format(cls, v: str) -> str:
        try:
            decoded = base64.b64decode(v, validate=True)
            if len(decoded) > 131072:  # 128KB max decoded size for state vector
                raise ValueError(
                    f"Decoded state vector too large: {len(decoded)} bytes (max 128KB)"
                )

        except Exception as e:
            raise ValueError(
                f"Invalid base64 encoding in state vector: {str(e)}"
            )

        return v
