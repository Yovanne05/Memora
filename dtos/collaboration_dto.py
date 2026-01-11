import base64
import re
from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field, field_validator

UUID_PATTERN = re.compile(
    r"^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$",
    re.IGNORECASE,
)


def _validate_note_id_format(value: str) -> str:
    if not UUID_PATTERN.match(value):
        raise ValueError(
            f"Invalid note_id format. Expected UUID, got: {value[:50]}"
        )
    return value


def _validate_base64_payload(
    value: str,
    max_decoded_size: int,
    label: str,
) -> str:
    try:
        decoded = base64.b64decode(value, validate=True)
        if len(decoded) > max_decoded_size:
            raise ValueError(
                f"Decoded {label} too large: {len(decoded)} bytes (max {max_decoded_size} bytes)"
            )
    except Exception as exc:
        raise ValueError(f"Invalid base64 encoding in {label}: {exc}")
    return value


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


class JoinCollaborationDTO(BaseModel):
    note_id: str = Field(
        min_length=1,
        max_length=36,
        description="UUID of the note (36 chars max including hyphens)",
    )
    content: str | None = Field(
        default=None,
        max_length=10485760,  # 10MB max
        description="Initial document content",
    )

    @field_validator("note_id")
    @classmethod
    def validate_note_id_format(cls, v: str) -> str:
        return _validate_note_id_format(v)


class LeaveCollaborationDTO(BaseModel):
    note_id: str = Field(
        min_length=1,
        max_length=36,
        description="UUID of the note (36 chars max including hyphens)",
    )

    @field_validator("note_id")
    @classmethod
    def validate_note_id_format(cls, v: str) -> str:
        return _validate_note_id_format(v)


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
        return _validate_note_id_format(v)

    @field_validator("update")
    @classmethod
    def validate_base64_format(cls, v: str) -> str:
        return _validate_base64_payload(v, 2097152, "CRDT update")


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
        return _validate_note_id_format(v)

    @field_validator("state_vector")
    @classmethod
    def validate_state_vector_format(cls, v: str) -> str:
        return _validate_base64_payload(v, 131072, "state vector")
