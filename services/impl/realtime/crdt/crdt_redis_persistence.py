from datetime import timedelta
from typing import Optional

from pycrdt import Doc

from services.impl.realtime.crdt.crdt_cache_service import CRDTCacheService
from services.impl.realtime.crdt.crdt_document_service import CRDTDocumentService
from services.interfaces.realtime.crdt_redis_persistence_interface import (
    CRDTRedisPersistenceInterface,
)


class CRDTRedisPersistence(CRDTRedisPersistenceInterface):
    def __init__(
        self,
        redis_client=None,
        ttl_seconds: int | None = None,
        document_service: CRDTDocumentService | None = None,
    ):
        ttl = ttl_seconds or int(timedelta(hours=24).total_seconds())
        self._cache_service = CRDTCacheService(
            redis_client=redis_client,
            ttl_seconds=ttl,
            document_service=document_service,
        )

    def load(self, note_id: str) -> Optional[Doc]:
        return self._cache_service.load(note_id)

    def save(self, note_id: str, doc: Doc) -> None:
        self._cache_service.save(note_id, doc)

    def delete(self, note_id: str) -> None:
        self._cache_service.delete(note_id)
