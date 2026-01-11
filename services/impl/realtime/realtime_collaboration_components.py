from domain_services.collaboration_session_service import (
    collaboration_domain_session_service,
)
from domain_services.realtime_collaboration_domain_service import (
    DEFAULT_EMPTY_DOCUMENT,
    ensure_note_exists,
    ensure_user_exists,
    normalize_note_content,
    resolve_note_content,
)
from repositorys import note_repository, user_repository
from services.impl.realtime.crdt.crdt_service_impl import get_crdt_service


class CollaborationDataService:
    def __init__(self, note_repo=note_repository, user_repo=user_repository):
        self._note_repo = note_repo
        self._user_repo = user_repo

    def get_note_or_raise(self, note_id: str):
        note = self._note_repo.find_one_unscoped(note_id)
        ensure_note_exists(note)
        return note

    def get_user_or_raise(self, user_id: str):
        user = self._user_repo.find_one(user_id)
        ensure_user_exists(user)
        return user

    def resolve_and_persist_content(
        self, note_id: str, note, initial_content: str | None
    ) -> str:
        resolved_content = resolve_note_content(note.content, initial_content)
        normalized_content = normalize_note_content(
            resolved_content, fallback=DEFAULT_EMPTY_DOCUMENT
        )
        if normalized_content and note.content != normalized_content:
            note.content = normalized_content
            self._note_repo.update_content(note_id, normalized_content)
        return normalized_content

    @staticmethod
    def normalize_content(content: str | None, fallback: str | None) -> str | None:
        return normalize_note_content(content, fallback=fallback)

    def update_content_if_changed(self, note_id: str, note, content: str | None) -> None:
        if content and content != note.content:
            note.content = content
            self._note_repo.update_content(note_id, content)


class CollaborationSessionManager:
    def __init__(self, session_service=collaboration_domain_session_service):
        self._session_service = session_service

    def get_username_by_socket(self, socket_id: str) -> str:
        session_data = self._session_service.find_session_by_socket(socket_id)
        return session_data.get("username") if session_data else "Unknown"

    def register_session(
        self, note_id: str, user_id: str, socket_id: str, username: str
    ) -> list[dict]:
        self._session_service.cleanup_user_sessions(note_id, user_id)
        self._session_service.create_session(note_id, user_id, socket_id, username)
        return self._session_service.list_sessions_by_note(note_id)

    def pop_session(self, socket_id: str) -> dict | None:
        session_data = self._session_service.find_session_by_socket(socket_id)
        if not session_data:
            return None
        self._session_service.delete_session_by_socket(socket_id)
        return session_data


class CRDTDocumentCoordinator:
    def __init__(self, crdt_service=None):
        self._crdt_service = crdt_service or get_crdt_service()

    def ensure_document(self, note_id: str, seed_content: str | None) -> None:
        self._crdt_service.get_or_create_document(note_id, seed_content)

    def apply_update(self, note_id: str, update: bytes, seed_content: str | None) -> None:
        self.ensure_document(note_id, seed_content)
        try:
            self._crdt_service.apply_update(note_id, update)
        except ValueError:
            self.ensure_document(note_id, seed_content)
            self._crdt_service.apply_update(note_id, update)

    def get_text(self, note_id: str, seed_content: str | None) -> str:
        try:
            return self._crdt_service.get_content_as_text(note_id)
        except ValueError:
            self.ensure_document(note_id, seed_content)
            return self._crdt_service.get_content_as_text(note_id)

    def get_sync_payload(
        self, note_id: str, client_state_vector: bytes, seed_content: str | None
    ) -> tuple[bytes, bytes]:
        self.ensure_document(note_id, seed_content)
        try:
            update_bytes = self._crdt_service.get_update_since_state(
                note_id, client_state_vector
            )
            server_state_vector = self._crdt_service.get_state_vector(note_id)
        except ValueError:
            self.ensure_document(note_id, seed_content)
            update_bytes = self._crdt_service.get_update_since_state(
                note_id, client_state_vector
            )
            server_state_vector = self._crdt_service.get_state_vector(note_id)
        return server_state_vector, update_bytes

    def resync_if_diverged(
        self, note_id: str, safe_content: str | None, raw_content: str | None
    ) -> None:
        if safe_content and safe_content != raw_content:
            self._crdt_service.delete_document(note_id)
            self._crdt_service.get_or_create_document(note_id, safe_content)
