import base64
import json
from typing import Optional

from pycrdt import Doc

from services.impl.realtime.crdt.crdt_document_service import CRDTDocumentService
from utils.logger import get_logger

logger = get_logger(__name__)


class CRDTCacheService:
    def __init__(
        self,
        redis_client=None,
        ttl_seconds: int = 0,
        document_service: CRDTDocumentService | None = None,
    ):
        self._redis_client = redis_client
        self._ttl_seconds = ttl_seconds
        self._document_service = document_service or CRDTDocumentService()

    def load(self, note_id: str) -> Optional[Doc]:
        if not self._redis_client:
            return None

        try:
            data_json = self._redis_client.get(self._build_key(note_id))
            if not data_json:
                return None

            data = json.loads(data_json)
            document_update = base64.b64decode(data["document_update"])
            return self._document_service.create_from_update(document_update)
        except Exception as exc:
            logger.warning(f"Failed to load CRDT from Redis for note {note_id}: {exc}")
            return None

    def save(self, note_id: str, doc: Doc) -> None:
        if not self._redis_client:
            return

        try:
            state_vector = doc.get_state()
            document_update = doc.get_update()

            data = {
                "state_vector": base64.b64encode(state_vector).decode("utf-8"),
                "document_update": base64.b64encode(document_update).decode("utf-8"),
            }

            self._redis_client.setex(
                self._build_key(note_id), self._ttl_seconds, json.dumps(data)
            )
        except Exception as exc:
            logger.error(f"Failed to save CRDT to Redis for note {note_id}: {exc}")

    def delete(self, note_id: str) -> None:
        if not self._redis_client:
            return

        try:
            self._redis_client.delete(self._build_key(note_id))
            logger.info(f"CRDT document deleted from Redis: {note_id}")
        except Exception as exc:
            logger.warning(f"Failed to delete CRDT from Redis: {exc}")

    @staticmethod
    def _build_key(note_id: str) -> str:
        return f"crdt:doc:{note_id}"
