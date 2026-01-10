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


def list_sessions_by_note(note_id: str) -> list[dict]:
    store = get_collaboration_store()
    return store.list_sessions_by_note(note_id)


def delete_session_by_socket(socket_id: str) -> None:
    store = get_collaboration_store()
    store.delete_session(socket_id)
