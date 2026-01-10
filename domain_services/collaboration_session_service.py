from typing import Optional

from services.impl.infrastructure.collaboration_session_store_impl import (
    collaboration_session_store,
)
from utils.logger import get_logger

logger = get_logger(__name__)


class CollaborationSessionService:
    """
    Service de gestion des sessions de collaboration.

    Responsabilités :
    - Créer des sessions de collaboration (note + user + socket)
    - Récupérer les sessions par socket_id ou note_id
    - Supprimer les sessions (déconnexion, timeout)
    - Nettoyer les sessions stale d'un utilisateur
    """

    def __init__(self):
        self._store = collaboration_session_store

    def create_session(
        self, note_id: str, user_id: str, socket_id: str, username: str
    ) -> dict:
        self._store.create_session(note_id, user_id, socket_id, username)

        logger.info(
            f"Collaboration session created: note={note_id}, user={user_id}, socket={socket_id}"
        )

        return {
            "note_id": note_id,
            "user_id": user_id,
            "socket_id": socket_id,
            "username": username,
        }

    def find_session_by_socket(self, socket_id: str) -> Optional[dict]:
        return self._store.get_session_by_socket(socket_id)

    def list_sessions_by_note(self, note_id: str) -> list[dict]:
        return self._store.list_sessions_by_note(note_id)

    def delete_session_by_socket(self, socket_id: str) -> None:
        session = self.find_session_by_socket(socket_id)
        if session:
            note_id = session.get("note_id")
            user_id = session.get("user_id")
            logger.info(
                f"Deleting collaboration session: note={note_id}, user={user_id}, socket={socket_id}"
            )

        self._store.delete_session(socket_id)

    def cleanup_user_sessions(self, note_id: str, user_id: str) -> list[str]:
        existing_sessions = self.list_sessions_by_note(note_id)
        stale_socket_ids = [
            session.get("socket_id")
            for session in existing_sessions
            if session.get("user_id") == user_id and session.get("socket_id")
        ]

        for socket_id in stale_socket_ids:
            self.delete_session_by_socket(socket_id)

        if stale_socket_ids:
            logger.info(
                f"Cleaned up {len(stale_socket_ids)} stale sessions for user={user_id}, note={note_id}"
            )

        return stale_socket_ids


_collaboration_session_service: Optional[CollaborationSessionService] = None


def get_collaboration_session_service() -> CollaborationSessionService:
    global _collaboration_session_service
    if _collaboration_session_service is None:
        _collaboration_session_service = CollaborationSessionService()
    return _collaboration_session_service


collaboration_domain_session_service = get_collaboration_session_service()
