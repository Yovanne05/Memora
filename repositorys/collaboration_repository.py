from typing import List
from daos.note_collaboration_dao import NoteCollaborationHistory
from utils.db import get_db_session
from utils.redis_client import get_collaboration_store


def create_session(note_id: str, user_id: str, socket_id: str, username: str) -> dict:
    store = get_collaboration_store()
    store.create_session(note_id, user_id, socket_id, username)
    return {
        "note_id": note_id,
        "user_id": user_id,
        "socket_id": socket_id,
        "username": username,
    }


def find_session_by_socket(socket_id: str) -> dict | None:
    store = get_collaboration_store()
    return store.get_session_by_socket(socket_id)


def list_sessions_by_note(note_id: str) -> List[dict]:
    store = get_collaboration_store()
    return store.list_sessions_by_note(note_id)


def delete_session_by_socket(socket_id: str) -> None:
    store = get_collaboration_store()
    store.delete_session(socket_id)


def get_latest_version_for_note(note_id: str) -> int:
    store = get_collaboration_store()
    return store.get_version(note_id)


def increment_version_for_note(note_id: str) -> int:
    store = get_collaboration_store()
    return store.increment_version(note_id)


def store_operation_in_redis(
    note_id: str,
    user_id: str,
    operation_type: str,
    position: int,
    content: str,
    length: int | None,
    version: int,
) -> None:
    store = get_collaboration_store()
    store.store_operation(
        note_id, user_id, operation_type, position, content, length, version
    )


def set_cursor_position(note_id: str, user_id: str, position: int) -> None:
    store = get_collaboration_store()
    store.set_cursor_position(note_id, user_id, position)


def set_typing_status(note_id: str, user_id: str, is_typing: bool) -> None:
    store = get_collaboration_store()
    store.set_typing_status(note_id, user_id, is_typing)
