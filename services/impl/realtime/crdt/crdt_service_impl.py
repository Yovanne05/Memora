from typing import Optional
from pycrdt import Doc

from services.impl.realtime.crdt.crdt_document_service import CRDTDocumentService
from services.impl.realtime.crdt.crdt_document_store import CRDTDocumentStore
from services.impl.realtime.crdt.crdt_redis_persistence import CRDTRedisPersistence
from services.impl.realtime.crdt.crdt_snapshot_service import CRDTSnapshotService
from services.interfaces.realtime.crdt_service_interface import (
    CRDTServiceInterface,
)
from utils.logger import get_logger

logger = get_logger(__name__)


class CRDTService(CRDTServiceInterface):
    """
    Service to manage CRDT documents with multi-level persistence.

    Persistence layers:
    - RAM: in-memory cache (CRDTDocumentStore)
    - Redis: distributed cache with TTL
    - PostgreSQL: long-term snapshots
    """

    def __init__(self, redis_client=None, store: CRDTDocumentStore | None = None):
        self._store = store or CRDTDocumentStore()
        self._document_service = CRDTDocumentService()
        self._redis_persistence = CRDTRedisPersistence(
            redis_client=redis_client,
            document_service=self._document_service,
        )
        self._snapshot_service = CRDTSnapshotService(
            document_service=self._document_service
        )

    def get_or_create_document(
        self, note_id: str, initial_content: Optional[str] = None
    ) -> Doc:
        doc = self._store.get(note_id)
        if doc is not None:
            return doc

        doc = self._redis_persistence.load(note_id)
        if doc is not None:
            doc = self._maybe_override_with_initial_content(
                note_id, doc, initial_content
            )
            self._store.set(note_id, doc)
            logger.info(f"CRDT document loaded from Redis: {note_id}")
            return doc

        doc = self._snapshot_service.load_snapshot(note_id)
        if doc is not None:
            doc = self._maybe_override_with_initial_content(
                note_id, doc, initial_content
            )
            self._store.set(note_id, doc)
            self._redis_persistence.save(note_id, doc)
            logger.info(f"CRDT document loaded from PostgreSQL: {note_id}")
            return doc

        doc = self._document_service.build_document(initial_content)
        self._store.set(note_id, doc)
        self._redis_persistence.save(note_id, doc)
        logger.info(f"CRDT document created: {note_id}")

        return doc

    def get_document(self, note_id: str) -> Optional[Doc]:
        return self._store.get(note_id)

    def delete_document(self, note_id: str) -> bool:
        deleted = self._store.delete(note_id)
        self._redis_persistence.delete(note_id)

        return deleted

    def list_active_note_ids(self) -> list[str]:
        return self._store.list_note_ids()

    def get_content_as_text(self, note_id: str) -> str:
        doc = self.get_document(note_id)
        if doc is None:
            raise ValueError(f"CRDT document not found for note {note_id}")

        text = self._document_service.get_text(doc)
        return text or ""

    def apply_update(self, note_id: str, update: bytes) -> None:
        doc = self.get_document(note_id)
        if doc is None:
            raise ValueError(f"CRDT document not found for note {note_id}")

        doc.apply_update(update)
        self._redis_persistence.save(note_id, doc)

    def get_state_vector(self, note_id: str) -> bytes:
        doc = self.get_document(note_id)
        if doc is None:
            raise ValueError(f"CRDT document not found for note {note_id}")
        return doc.get_state()

    def get_update_since_state(self, note_id: str, state_vector: bytes) -> bytes:
        doc = self.get_document(note_id)
        if doc is None:
            raise ValueError(f"CRDT document not found for note {note_id}")
        return doc.get_update(state_vector)

    def save_snapshot_to_database(self, note_id: str) -> bool:
        doc = self.get_document(note_id)
        if doc is None:
            logger.warning(
                f"Cannot save snapshot: document not found for note {note_id}"
            )
            return False

        try:
            saved = self._snapshot_service.save_snapshot(note_id, doc)
            if not saved:
                logger.warning(
                    f"Cannot save snapshot: note not found for note {note_id}"
                )
                self.delete_document(note_id)
                return False
            return True
        except Exception as exc:
            logger.error(
                f"Failed to save CRDT snapshot to database for note {note_id}: {exc}"
            )
            return False

    def _maybe_override_with_initial_content(
        self, note_id: str, doc: Doc, initial_content: Optional[str]
    ) -> Doc:
        if not initial_content:
            return doc

        current_text = self._document_service.get_text(doc)
        if current_text == initial_content:
            return doc

        new_doc = self._document_service.build_document(initial_content)
        self._redis_persistence.save(note_id, new_doc)
        logger.info(f"CRDT document resynced from note content: {note_id}")
        return new_doc


