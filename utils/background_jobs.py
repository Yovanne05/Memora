import threading
import time
from typing import Optional

from utils.logger import get_logger
from utils.crdt_service import get_crdt_service
from utils.redis_client import get_collaboration_store

logger = get_logger(__name__)


class BackgroundJobsScheduler:
    """
    Scheduler pour les jobs périodiques de maintenance.

    Architecture :
    - Thread dédié pour ne pas bloquer l'application principale
    - Intervalle configurable pour chaque job
    - Gestion gracieuse de l'arrêt
    """

    def __init__(
        self,
        crdt_snapshot_interval: int = 300,  # 5 minutes
        session_cleanup_interval: int = 600,  # 10 minutes
    ):
        self._crdt_snapshot_interval = crdt_snapshot_interval
        self._session_cleanup_interval = session_cleanup_interval
        self._running = False
        self._thread: Optional[threading.Thread] = None

    def start(self) -> None:
        """Démarre le scheduler en arrière-plan."""
        if self._running:
            logger.warning("BackgroundJobsScheduler already running")
            return

        self._running = True
        self._thread = threading.Thread(target=self._run, daemon=True)
        self._thread.start()
        logger.info(
            f"BackgroundJobsScheduler started "
            f"(CRDT snapshot: {self._crdt_snapshot_interval}s, "
            f"session cleanup: {self._session_cleanup_interval}s)"
        )

    def stop(self) -> None:
        if not self._running:
            return

        self._running = False
        if self._thread:
            self._thread.join(timeout=5)
        logger.info("BackgroundJobsScheduler stopped")

    def _run(self) -> None:
        last_crdt_snapshot = 0.0
        last_session_cleanup = 0.0

        while self._running:
            try:
                current_time = time.time()

                # Sauvegarde CRDT
                if current_time - last_crdt_snapshot >= self._crdt_snapshot_interval:
                    self._run_crdt_snapshot_job()
                    last_crdt_snapshot = current_time

                # Cleanup sessions
                if current_time - last_session_cleanup >= self._session_cleanup_interval:
                    self._run_session_cleanup_job()
                    last_session_cleanup = current_time

                # Sleep 10s entre chaque vérification
                time.sleep(10)

            except Exception as e:
                logger.error(f"Error in background jobs scheduler: {e}", exc_info=True)
                time.sleep(10)  # Retry après erreur

    def _run_crdt_snapshot_job(self) -> None:
        """
        Sauvegarde tous les documents CRDT actifs dans PostgreSQL.

        Permet de :
        - Persister les documents au-delà du TTL Redis (24h)
        - Récupérer les documents après un redémarrage complet
        - Supporter le scaling horizontal
        """
        try:
            crdt_service = get_crdt_service()
            active_note_ids = list(crdt_service._documents.keys())

            if not active_note_ids:
                logger.debug("No active CRDT documents to snapshot")
                return

            success_count = 0
            for note_id in active_note_ids:
                try:
                    if crdt_service.save_snapshot_to_database(note_id):
                        success_count += 1
                except Exception as e:
                    logger.error(f"Failed to snapshot CRDT for note {note_id}: {e}")

        except Exception as e:
            logger.error(f"CRDT snapshot job failed: {e}", exc_info=True)

    def _run_session_cleanup_job(self) -> None:
        """
        Nettoie les sessions de collaboration expirées.

        Retire de Redis les sessions dont le TTL est expiré ou invalides.

        Note : Redis gère déjà l'expiration automatique via TTL,
        mais ce job nettoie les références orphelines dans les sets.
        """
        try:
            store = get_collaboration_store()
            redis_client = store.client

            pattern = "collab:note:*:sessions"
            cleaned_count = 0

            for key in redis_client.scan_iter(match=pattern, count=100):
                try:
                    socket_ids = redis_client.smembers(key)

                    for socket_id in socket_ids:
                        session = store.get_session_by_socket(socket_id)
                        if not session:
                            redis_client.srem(key, socket_id)
                            cleaned_count += 1

                except Exception as e:
                    logger.warning(f"Failed to clean sessions for key {key}: {e}")

        except Exception as e:
            logger.error(f"Session cleanup job failed: {e}", exc_info=True)


# Instance globale du scheduler
_scheduler: Optional[BackgroundJobsScheduler] = None


def init_background_jobs(
    crdt_snapshot_interval: int = 300,
    session_cleanup_interval: int = 600,
) -> BackgroundJobsScheduler:
    global _scheduler

    if _scheduler is not None:
        logger.warning("Background jobs scheduler already initialized")
        return _scheduler

    _scheduler = BackgroundJobsScheduler(
        crdt_snapshot_interval=crdt_snapshot_interval,
        session_cleanup_interval=session_cleanup_interval,
    )
    _scheduler.start()

    return _scheduler


def get_background_jobs_scheduler() -> Optional[BackgroundJobsScheduler]:
    return _scheduler


def stop_background_jobs() -> None:
    global _scheduler
    if _scheduler:
        _scheduler.stop()
        _scheduler = None
