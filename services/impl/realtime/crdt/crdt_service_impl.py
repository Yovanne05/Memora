from typing import Dict, Optional
import threading
import json
import base64
from datetime import timedelta

from pycrdt import Doc, Text

from repositorys import crdt_snapshot_repository
from utils.logger import get_logger

logger = get_logger(__name__)


class CRDTDocumentStore:
    def __init__(self):
        self._documents: Dict[str, Doc] = {}
        self._lock = threading.Lock()

    def get(self, note_id: str) -> Optional[Doc]:
        with self._lock:
            return self._documents.get(note_id)

    def set(self, note_id: str, doc: Doc) -> None:
        with self._lock:
            self._documents[note_id] = doc

    def delete(self, note_id: str) -> bool:
        with self._lock:
            if note_id in self._documents:
                del self._documents[note_id]
                return True
        return False

    def list_note_ids(self) -> list[str]:
        with self._lock:
            return list(self._documents.keys())


class CRDTService:
    """
    Service to manage CRDT documents with multi-level persistence.

    Persistence layers:
    - RAM: in-memory cache (CRDTDocumentStore)
    - Redis: distributed cache with TTL
    - PostgreSQL: long-term snapshots
    """

    def __init__(self, redis_client=None, store: CRDTDocumentStore | None = None):
        self._store = store or CRDTDocumentStore()
        self._redis_client = redis_client
        self._redis_ttl = int(timedelta(hours=24).total_seconds())

    def get_or_create_document(
        self, note_id: str, initial_content: Optional[str] = None
    ) -> Doc:
        doc = self._store.get(note_id)
        if doc is not None:
            return doc

        doc = self._load_from_redis(note_id)
        if doc is not None:
            doc = self._maybe_override_with_initial_content(
                note_id, doc, initial_content
            )
            self._store.set(note_id, doc)
            logger.info(f"CRDT document loaded from Redis: {note_id}")
            return doc

        doc = self._load_from_database(note_id)
        if doc is not None:
            doc = self._maybe_override_with_initial_content(
                note_id, doc, initial_content
            )
            self._store.set(note_id, doc)
            self._save_to_redis(note_id, doc)
            logger.info(f"CRDT document loaded from PostgreSQL: {note_id}")
            return doc

        doc = self._build_document(initial_content)
        self._store.set(note_id, doc)
        self._save_to_redis(note_id, doc)
        logger.info(f"CRDT document created: {note_id}")

        return doc

    def get_document(self, note_id: str) -> Optional[Doc]:
        return self._store.get(note_id)

    def delete_document(self, note_id: str) -> bool:
        deleted = self._store.delete(note_id)

        if self._redis_client:
            try:
                redis_key = self._get_redis_key(note_id)
                self._redis_client.delete(redis_key)
                logger.info(f"CRDT document deleted from Redis: {note_id}")
            except Exception as exc:
                logger.warning(f"Failed to delete CRDT from Redis: {exc}")

        return deleted

    def list_active_note_ids(self) -> list[str]:
        return self._store.list_note_ids()

    def get_content_as_text(self, note_id: str) -> str:
        doc = self.get_document(note_id)
        if doc is None:
            raise ValueError(f"CRDT document not found for note {note_id}")

        text = doc.get("content", type=Text)
        if isinstance(text, Text):
            return str(text)
        return ""

    def apply_update(self, note_id: str, update: bytes) -> None:
        doc = self.get_document(note_id)
        if doc is None:
            raise ValueError(f"CRDT document not found for note {note_id}")

        doc.apply_update(update)
        self._save_to_redis(note_id, doc)

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

        state_vector = doc.get_state()
        document_update = doc.get_update()

        try:
            saved = crdt_snapshot_repository.save_snapshot(
                note_id=note_id,
                state_vector=state_vector,
                document_update=document_update,
            )
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

    def _build_document(self, initial_content: Optional[str]) -> Doc:
        doc = Doc()
        text = Text()
        doc["content"] = text
        if initial_content:
            self._seed_document(doc, text, initial_content)
        return doc

    def _seed_document(self, doc: Doc, text: Text, initial_content: str) -> None:
        content = initial_content.strip()
        if not content:
            return
        with doc.transaction():
            text += initial_content

    def _get_doc_text(self, doc: Doc) -> Optional[str]:
        text = doc.get("content", type=Text)
        if isinstance(text, Text):
            return str(text)
        return None

    def _maybe_override_with_initial_content(
        self, note_id: str, doc: Doc, initial_content: Optional[str]
    ) -> Doc:
        if not initial_content:
            return doc

        current_text = self._get_doc_text(doc)
        if current_text == initial_content:
            return doc

        new_doc = self._build_document(initial_content)
        self._save_to_redis(note_id, new_doc)
        logger.info(f"CRDT document resynced from note content: {note_id}")
        return new_doc

    def _get_redis_key(self, note_id: str) -> str:
        return f"crdt:doc:{note_id}"

    def _save_to_redis(self, note_id: str, doc: Doc) -> None:
        if not self._redis_client:
            return

        try:
            state_vector = doc.get_state()
            document_update = doc.get_update()

            data = {
                "state_vector": base64.b64encode(state_vector).decode("utf-8"),
                "document_update": base64.b64encode(document_update).decode("utf-8"),
            }

            redis_key = self._get_redis_key(note_id)
            self._redis_client.setex(redis_key, self._redis_ttl, json.dumps(data))
        except Exception as exc:
            logger.error(f"Failed to save CRDT to Redis for note {note_id}: {exc}")

    def _load_from_redis(self, note_id: str) -> Optional[Doc]:
        if not self._redis_client:
            return None

        try:
            redis_key = self._get_redis_key(note_id)
            data_json = self._redis_client.get(redis_key)
            if not data_json:
                return None

            data = json.loads(data_json)
            document_update = base64.b64decode(data["document_update"])

            doc = Doc()
            doc["content"] = Text()
            doc.apply_update(document_update)
            return doc
        except Exception as exc:
            logger.warning(f"Failed to load CRDT from Redis for note {note_id}: {exc}")
            return None

    def _load_from_database(self, note_id: str) -> Optional[Doc]:
        try:
            snapshot = crdt_snapshot_repository.find_one_by_note_id(note_id)
            if not snapshot:
                return None

            doc = Doc()
            doc["content"] = Text()
            doc.apply_update(snapshot.document_update)
            return doc
        except Exception as exc:
            logger.warning(
                f"Failed to load CRDT from database for note {note_id}: {exc}"
            )
            return None


_crdt_service: Optional[CRDTService] = None
_crdt_service_lock = threading.Lock()


def get_crdt_service() -> CRDTService:
    """Return the singleton CRDT service, creating it if missing."""
    global _crdt_service
    if _crdt_service is None:
        with _crdt_service_lock:
            if _crdt_service is None:
                logger.warning(
                    "CRDTService not initialized, creating without Redis client"
                )
                _crdt_service = CRDTService()
    return _crdt_service


def init_crdt_service(redis_client=None) -> CRDTService:
    """Initialize the singleton CRDT service with an optional Redis client."""
    global _crdt_service
    with _crdt_service_lock:
        _crdt_service = CRDTService(redis_client=redis_client)
    return _crdt_service
