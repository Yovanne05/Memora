import base64

from dtos.collaboration_dto import (
    CollaboratorDTO,
    CollaborationEventDTO,
    CollaborationSessionDTO,
)
from exceptions.collaboration_exception import (
    CollaborationInvalidOperation,
    CollaborationNotAuthorized,
)
from domain_services.permission_domain_service import permission_domain_service
from utils.enums import RoleEnum

DEFAULT_EMPTY_DOCUMENT = '{"type":"doc","content":[{"type":"paragraph"}]}'


def ensure_note_exists(note) -> None:
    if not note:
        raise ValueError("Note not found")


def ensure_user_exists(user) -> None:
    if not user:
        raise ValueError("User not found")


def ensure_can_read(note_id: str, user_id: str, user_role: RoleEnum) -> None:
    if not permission_domain_service.can_read_note(note_id, user_id, user_role):
        raise CollaborationNotAuthorized()


def ensure_can_write(note_id: str, user_id: str, user_role: RoleEnum) -> None:
    if not permission_domain_service.can_write_note(note_id, user_id, user_role):
        raise CollaborationNotAuthorized()


def resolve_note_content(note_content: str | None, initial_content: str | None) -> str:
    if not (note_content or "").strip():
        return initial_content or DEFAULT_EMPTY_DOCUMENT
    return note_content


def build_session_dto(note_id: str, sessions: list[dict]) -> CollaborationSessionDTO:
    collaborators = [
        CollaboratorDTO(
            user_id=session["user_id"],
            username=session["username"],
            socket_id=session["socket_id"],
        )
        for session in sessions
    ]

    return CollaborationSessionDTO(
        note_id=note_id,
        collaborators=collaborators,
        active_users_count=len(collaborators),
    )


def build_join_event(note_id: str, user_id: str, username: str) -> CollaborationEventDTO:
    return CollaborationEventDTO(
        event_type="user_joined",
        user_id=user_id,
        username=username,
        note_id=note_id,
    )


def build_leave_event(note_id: str, user_id: str, username: str) -> CollaborationEventDTO:
    return CollaborationEventDTO(
        event_type="user_left",
        user_id=user_id,
        username=username,
        note_id=note_id,
    )


def build_crdt_update_event(
    note_id: str, user_id: str, username: str, update_b64: str
) -> CollaborationEventDTO:
    return CollaborationEventDTO(
        event_type="crdt_update",
        user_id=user_id,
        username=username,
        note_id=note_id,
        crdt_update=update_b64,
    )


def decode_base64(value: str, label: str) -> bytes:
    try:
        return base64.b64decode(value)
    except Exception as exc:
        raise CollaborationInvalidOperation(f"Invalid base64-encoded {label}") from exc


def encode_base64(value: bytes) -> str:
    return base64.b64encode(value).decode("utf-8")
