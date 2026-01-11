from typing import Optional, Protocol


class CRDTDocumentCoordinatorInterface(Protocol):
    def ensure_document(self, note_id: str, seed_content: Optional[str]) -> None:
        ...

    def apply_update(
        self, note_id: str, update: bytes, seed_content: Optional[str]
    ) -> None:
        ...

    def get_text(self, note_id: str, seed_content: Optional[str]) -> str:
        ...

    def get_sync_payload(
        self,
        note_id: str,
        client_state_vector: bytes,
        seed_content: Optional[str],
    ) -> tuple[bytes, bytes]:
        ...

    def resync_if_diverged(
        self,
        note_id: str,
        safe_content: Optional[str],
        raw_content: Optional[str],
    ) -> None:
        ...
