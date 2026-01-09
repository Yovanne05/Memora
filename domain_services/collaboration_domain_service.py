from typing import List
from datetime import datetime, timezone
import json

from dtos.collaboration_dto import (
    CollaboratorDTO,
    CollaborationSessionDTO,
    CollaborationOperationDTO,
)
from exceptions.collaboration_exception import (
    CollaborationInvalidOperation,
    CollaborationVersionConflict,
)


def validate_operation(
    operation: CollaborationOperationDTO, content_length: int, current_version: int
) -> None:
    """Validates a collaboration operation."""
    if operation.version != current_version + 1:
        raise CollaborationVersionConflict(current_version + 1, operation.version)

    if operation.position < 0 or operation.position > content_length:
        raise CollaborationInvalidOperation(
            f"Position {operation.position} is out of range (0-{content_length})"
        )

    if operation.operation_type == "insert":
        if not operation.content:
            raise CollaborationInvalidOperation("Insert operation requires content")

    elif operation.operation_type == "delete":
        if operation.length is None or operation.length <= 0:
            raise CollaborationInvalidOperation(
                "Delete operation requires a positive length"
            )
        if operation.position + operation.length > content_length:
            raise CollaborationInvalidOperation(
                f"Delete range exceeds content length"
            )

    elif operation.operation_type == "replace":
        if not operation.content:
            raise CollaborationInvalidOperation("Replace operation requires content")
        if operation.length is None or operation.length < 0:
            raise CollaborationInvalidOperation(
                "Replace operation requires a non-negative length"
            )
        # For full document replacement (position=0), allow any length
        # This is used when synchronizing the entire document
        if operation.position == 0:
            # Full document replacement - no length validation needed
            pass
        elif operation.position + operation.length > content_length:
            # Partial replacement must be within bounds
            raise CollaborationInvalidOperation(
                f"Replace range exceeds content length: position={operation.position}, "
                f"length={operation.length}, content_length={content_length}"
            )


def apply_operation(content: str, operation: CollaborationOperationDTO) -> str:
    """Applies a collaboration operation to content."""
    if operation.operation_type == "insert":
        return (
            content[: operation.position]
            + operation.content
            + content[operation.position :]
        )

    elif operation.operation_type == "delete":
        end_pos = operation.position + (operation.length or 0)
        return content[: operation.position] + content[end_pos:]

    elif operation.operation_type == "replace":
        end_pos = operation.position + (operation.length or 0)
        return (
            content[: operation.position]
            + operation.content
            + content[end_pos:]
        )

    raise CollaborationInvalidOperation(
        f"Unknown operation type: {operation.operation_type}"
    )


def build_session_dto_from_redis(
    note_id: str, sessions: List[dict], content: str | None = None, version: int = 0
) -> CollaborationSessionDTO:
    """Builds a collaboration session DTO from Redis session data."""
    collaborators = [
        CollaboratorDTO(
            user_id=session["user_id"],
            username=session["username"],
            socket_id=session["socket_id"],
            joined_at=datetime.now(timezone.utc),
        )
        for session in sessions
    ]

    return CollaborationSessionDTO(
        note_id=note_id,
        collaborators=collaborators,
        active_users_count=len(collaborators),
        content=content,
        version=version,
    )
