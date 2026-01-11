from typing import Optional

from pycrdt import Doc

from repositorys import crdt_snapshot_repository
from services.impl.realtime.crdt.crdt_document_service import CRDTDocumentService
from services.interfaces.realtime.crdt_snapshot_service_interface import (
    CRDTSnapshotServiceInterface,
)
from utils.logger import logger


class CRDTSnapshotService(CRDTSnapshotServiceInterface):
    def __init__(
        self,
        repository=crdt_snapshot_repository,
        document_service: CRDTDocumentService | None = None,
    ):
        self._repository = repository
        self._document_service = document_service or CRDTDocumentService()

    def load_snapshot(self, note_id: str) -> Optional[Doc]:
        try:
            snapshot = self._repository.find_one_by_note_id(note_id)
            if not snapshot:
                return None
            return self._document_service.create_from_update(snapshot.document_update)
        except Exception as exc:
            logger.warning(
                f"Failed to load CRDT from database for note {note_id}: {exc}"
            )
            return None

    def save_snapshot(self, note_id: str, doc: Doc) -> bool:
        state_vector = doc.get_state()
        document_update = doc.get_update()

        return self._repository.save_snapshot(
            note_id=note_id,
            state_vector=state_vector,
            document_update=document_update,
        )
