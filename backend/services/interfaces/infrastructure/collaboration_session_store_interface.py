from typing import Protocol


class CollaborationSessionStoreInterface(Protocol):
    def create_session(
        self, note_id: str, user_id: str, socket_id: str, username: str
    ) -> None:
        ...

    def get_session_by_socket(self, socket_id: str) -> dict | None:
        ...

    def delete_session(self, socket_id: str) -> None:
        ...

    def list_sessions_by_note(self, note_id: str) -> list[dict]:
        ...
