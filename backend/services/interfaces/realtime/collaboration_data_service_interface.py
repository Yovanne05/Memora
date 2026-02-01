from typing import Optional, Protocol

from daos.note_dao import Note
from daos.user_dao import User


class CollaborationDataServiceInterface(Protocol):
    def get_note_or_raise(self, note_id: str) -> Note:
        ...

    def get_user_or_raise(self, user_id: str) -> User:
        ...

    def resolve_and_persist_content(
        self, note_id: str, note: Note, initial_content: Optional[str]
    ) -> str:
        ...

    def normalize_content(
        self, content: Optional[str], fallback: Optional[str]
    ) -> Optional[str]:
        ...

    def update_content_if_changed(
        self, note_id: str, note: Note, content: Optional[str]
    ) -> None:
        ...
