"""
Collaboration Repository - Redis-based for real-time performance.

This repository uses Redis for all active collaboration sessions and operations.
Database persistence is optional and used only for audit history.
"""

from typing import List
from daos.note_collaboration_dao import NoteCollaborationHistory
from utils.db import get_db_session
from utils.redis_client import get_collaboration_store
from utils.logger import get_logger

logger = get_logger(__name__)



def create_session(note_id: str, user_id: str, socket_id: str, username: str) -> dict:
    """Creates a new collaboration session in Redis."""
    store = get_collaboration_store()
    store.create_session(note_id, user_id, socket_id, username)
    return {
        "note_id": note_id,
        "user_id": user_id,
        "socket_id": socket_id,
        "username": username,
    }


def find_session_by_socket(socket_id: str) -> dict | None:
    """Finds a collaboration session by socket ID from Redis."""
    store = get_collaboration_store()
    return store.get_session_by_socket(socket_id)


def find_session_by_user_and_note(user_id: str, note_id: str) -> bool:
    """Checks if user has an active session on a note in Redis."""
    store = get_collaboration_store()
    return store.user_has_session_on_note(user_id, note_id)


def list_sessions_by_note(note_id: str) -> List[dict]:
    """Lists all active collaboration sessions for a note from Redis."""
    store = get_collaboration_store()
    return store.list_sessions_by_note(note_id)


def delete_session_by_socket(socket_id: str) -> None:
    """Deletes a collaboration session by socket ID from Redis."""
    store = get_collaboration_store()
    store.delete_session(socket_id)


# ========== Redis-based Operation Management ==========


def get_latest_version_for_note(note_id: str) -> int:
    """Gets the latest operation version for a note from Redis."""
    store = get_collaboration_store()
    return store.get_version(note_id)


def increment_version_for_note(note_id: str) -> int:
    """Increments and returns the version for a note in Redis."""
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
    """Stores an operation in Redis for recent history."""
    store = get_collaboration_store()
    store.store_operation(
        note_id, user_id, operation_type, position, content, length, version
    )


def get_operations_since_version(note_id: str, since_version: int) -> List[dict]:
    """Gets operations since a specific version from Redis."""
    store = get_collaboration_store()
    return store.get_operations_since_version(note_id, since_version)


# ========== Cursor & Typing Status (Redis) ==========


def set_cursor_position(note_id: str, user_id: str, position: int) -> None:
    """Sets a user's cursor position in Redis."""
    store = get_collaboration_store()
    store.set_cursor_position(note_id, user_id, position)


def get_cursor_positions(note_id: str) -> dict:
    """Gets all cursor positions for a note from Redis."""
    store = get_collaboration_store()
    return store.get_cursor_positions(note_id)


def set_typing_status(note_id: str, user_id: str, is_typing: bool) -> None:
    """Sets a user's typing status in Redis."""
    store = get_collaboration_store()
    store.set_typing_status(note_id, user_id, is_typing)


def get_typing_users(note_id: str) -> set:
    """Gets all users currently typing on a note from Redis."""
    store = get_collaboration_store()
    return store.get_typing_users(note_id)


# ========== Optional: Persistent History (Database) ==========


def persist_operation_to_db(
    note_id: str,
    user_id: str,
    operation_type: str,
    position: int,
    content: str,
    version: int,
) -> None:
    """
    Optionally persists an operation to the database for audit history.

    This is asynchronous and should not block real-time operations.
    Consider using a background task queue (Celery) for production.
    """
    try:
        session = get_db_session()
        history_entry = NoteCollaborationHistory(
            note_id=note_id,
            user_id=user_id,
            operation_type=operation_type,
            position=position,
            content=content,
            version=version,
        )
        session.add(history_entry)
        session.commit()
    except Exception as e:
        logger.error(f"Failed to persist operation to DB: {e}")
        # Don't raise - persistence is optional and shouldn't break collaboration


def cleanup_note_collaboration_data(note_id: str) -> None:
    """Cleans up all collaboration data for a note from Redis."""
    store = get_collaboration_store()
    store.cleanup_note_data(note_id)
