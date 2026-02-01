from domain_services.collaboration_session_service import (
    collaboration_domain_session_service,
)
from services.interfaces.realtime.collaboration_session_manager_interface import (
    CollaborationSessionManagerInterface,
)


class CollaborationSessionManager(CollaborationSessionManagerInterface):
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
