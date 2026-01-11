from services.impl.realtime.crdt.crdt_service_provider import get_crdt_service
from services.impl.infrastructure.collaboration_session_store_impl import (
    collaboration_session_store,
)
from utils.logger import get_logger

logger = get_logger(__name__)


class CRDTSnapshotJob:
    def run(self) -> int:
        crdt_service = get_crdt_service()
        active_note_ids = crdt_service.list_active_note_ids()

        if not active_note_ids:
            logger.debug("No active CRDT documents to snapshot")
            return 0

        success_count = 0
        for note_id in active_note_ids:
            try:
                if crdt_service.save_snapshot_to_database(note_id):
                    success_count += 1
            except Exception as exc:
                logger.error(f"Failed to snapshot CRDT for note {note_id}: {exc}")

        return success_count


class CollaborationSessionCleanupJob:
    def run(self) -> int:
        redis_client = collaboration_session_store.client

        pattern = "collab:note:*:sessions"
        cleaned_count = 0

        for key in redis_client.scan_iter(match=pattern, count=100):
            try:
                socket_ids = redis_client.smembers(key)

                for socket_id in socket_ids:
                    session = collaboration_session_store.get_session_by_socket(socket_id)
                    if not session:
                        redis_client.srem(key, socket_id)
                        cleaned_count += 1
            except Exception as exc:
                logger.warning(f"Failed to clean sessions for key {key}: {exc}")

        return cleaned_count
