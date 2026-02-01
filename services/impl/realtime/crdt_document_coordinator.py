from services.impl.realtime.crdt.crdt_service_provider import get_crdt_service
from services.interfaces.realtime.crdt_document_coordinator_interface import (
    CRDTDocumentCoordinatorInterface,
)


class CRDTDocumentCoordinator(CRDTDocumentCoordinatorInterface):
    def __init__(self, crdt_service=None):
        self._crdt_service = crdt_service

    def _get_service(self):
        if self._crdt_service is None:
            self._crdt_service = get_crdt_service()
        return self._crdt_service

    def ensure_document(self, note_id: str, seed_content: str | None) -> None:
        self._get_service().get_or_create_document(note_id, seed_content)

    def apply_update(
        self, note_id: str, update: bytes, seed_content: str | None
    ) -> None:
        self.ensure_document(note_id, seed_content)
        try:
            self._get_service().apply_update(note_id, update)
        except ValueError:
            self.ensure_document(note_id, seed_content)
            self._get_service().apply_update(note_id, update)

    def get_text(self, note_id: str, seed_content: str | None) -> str:
        try:
            return self._get_service().get_content_as_text(note_id)
        except ValueError:
            self.ensure_document(note_id, seed_content)
            return self._get_service().get_content_as_text(note_id)

    def get_sync_payload(
        self, note_id: str, client_state_vector: bytes, seed_content: str | None
    ) -> tuple[bytes, bytes]:
        self.ensure_document(note_id, seed_content)
        try:
            update_bytes = self._get_service().get_update_since_state(
                note_id, client_state_vector
            )
            server_state_vector = self._get_service().get_state_vector(note_id)
        except ValueError:
            self.ensure_document(note_id, seed_content)
            update_bytes = self._get_service().get_update_since_state(
                note_id, client_state_vector
            )
            server_state_vector = self._get_service().get_state_vector(note_id)
        return server_state_vector, update_bytes

    def resync_if_diverged(
        self, note_id: str, safe_content: str | None, raw_content: str | None
    ) -> None:
        if safe_content and safe_content != raw_content:
            self._get_service().delete_document(note_id)
            self._get_service().get_or_create_document(note_id, safe_content)
