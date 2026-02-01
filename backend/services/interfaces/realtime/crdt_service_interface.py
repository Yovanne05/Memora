from typing import Optional, Protocol

from pycrdt import Doc


class CRDTServiceInterface(Protocol):
    def get_or_create_document(
        self, note_id: str, initial_content: Optional[str] = None
    ) -> Doc:
        ...

    def get_document(self, note_id: str) -> Optional[Doc]:
        ...

    def delete_document(self, note_id: str) -> bool:
        ...

    def list_active_note_ids(self) -> list[str]:
        ...

    def get_content_as_text(self, note_id: str) -> str:
        ...

    def apply_update(self, note_id: str, update: bytes) -> None:
        ...

    def get_state_vector(self, note_id: str) -> bytes:
        ...

    def get_update_since_state(self, note_id: str, state_vector: bytes) -> bytes:
        ...

    def save_snapshot_to_database(self, note_id: str) -> bool:
        ...
