from typing import Protocol


class CollaborationSessionManagerInterface(Protocol):
    def get_username_by_socket(self, socket_id: str) -> str:
        ...

    def register_session(
        self, note_id: str, user_id: str, socket_id: str, username: str
    ) -> list[dict]:
        ...

    def pop_session(self, socket_id: str) -> dict | None:
        ...
