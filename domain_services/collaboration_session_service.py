"""
Service de gestion des sessions de collaboration en temps réel.

Architecture :
- Utilise Redis comme store de sessions avec TTL
- Gère le cycle de vie des sessions (create, delete, list)
- Assure la cohérence des références entre note, user et socket_id

Note : Ce n'est PAS un repository car il ne fait pas d'abstraction DAO,
       c'est un service métier qui orchestre le stockage Redis.
"""
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
        """
        Crée une nouvelle session de collaboration.

        Args:
            note_id: ID de la note collaborée
            user_id: ID de l'utilisateur
            socket_id: ID du socket WebSocket
            username: Nom d'utilisateur pour affichage

        Returns:
            Dict contenant les informations de la session
        """
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
        """
        Trouve une session par son socket_id.

        Args:
            socket_id: ID du socket WebSocket

        Returns:
            Dict de la session ou None si non trouvée
        """
        return self._store.get_session_by_socket(socket_id)

    def list_sessions_by_note(self, note_id: str) -> list[dict]:
        """
        Liste toutes les sessions actives pour une note.

        Args:
            note_id: ID de la note

        Returns:
            Liste des sessions actives
        """
        return self._store.list_sessions_by_note(note_id)

    def delete_session_by_socket(self, socket_id: str) -> None:
        """
        Supprime une session par son socket_id.

        Args:
            socket_id: ID du socket WebSocket
        """
        session = self.find_session_by_socket(socket_id)
        if session:
            note_id = session.get("note_id")
            user_id = session.get("user_id")
            logger.info(
                f"Deleting collaboration session: note={note_id}, user={user_id}, socket={socket_id}"
            )

        self._store.delete_session(socket_id)

    def cleanup_user_sessions(self, note_id: str, user_id: str) -> list[str]:
        """
        Nettoie toutes les sessions stale d'un utilisateur pour une note.

        Utilisé avant de créer une nouvelle session pour éviter les doublons.

        Args:
            note_id: ID de la note
            user_id: ID de l'utilisateur

        Returns:
            Liste des socket_ids supprimés
        """
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


# Instance singleton du service
_collaboration_session_service: Optional[CollaborationSessionService] = None


def get_collaboration_session_service() -> CollaborationSessionService:
    """
    Récupère l'instance singleton du service de sessions.
    """
    global _collaboration_session_service
    if _collaboration_session_service is None:
        _collaboration_session_service = CollaborationSessionService()
    return _collaboration_session_service
