import base64
import json

from dtos.collaboration_dto import (
    CollaboratorDTO,
    CollaborationEventDTO,
    CollaborationSessionDTO,
)
from exceptions.collaboration_exception import (
    CollaborationInvalidOperation,
    CollaborationNotAuthorized,
)
from exceptions.note_exception import NoteNotFound
from exceptions.user_exception import UserNotFound
from domain_services.permission_domain_service import permission_domain_service
from utils.enums import RoleEnum

DEFAULT_EMPTY_DOCUMENT = '{"type":"doc","content":[{"type":"paragraph"}]}'


def ensure_note_exists(note) -> None:
    if not note:
        raise NoteNotFound()


def ensure_user_exists(user) -> None:
    if not user:
        raise UserNotFound()


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


def normalize_note_content(
    note_content: str | None, fallback: str | None = None
) -> str | None:
    if not (note_content or "").strip():
        return fallback

    content = note_content.strip()

    if _is_valid_json(content):
        return content

    if '"type":"doc"' in content:
        extracted = _extract_last_json_payload(content)
        if extracted:
            return extracted

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


def _is_valid_json(value: str) -> bool:
    try:
        json.loads(value)
        return True
    except ValueError:
        return False


def _extract_last_json_payload(value: str) -> str | None:
    decoder = json.JSONDecoder()
    last_span: tuple[int, int] | None = None
    length = len(value)
    index = 0

    while index < length:
        if value[index] not in "{[":
            index += 1
            continue
        try:
            _, end = decoder.raw_decode(value, index)
        except ValueError:
            index += 1
            continue
        last_span = (index, end)
        index = end

    if not last_span:
        return None
    start, end = last_span
    return value[start:end]
