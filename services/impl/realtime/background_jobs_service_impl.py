import threading
import time
from typing import Optional

from services.interfaces.realtime.background_jobs_service_interface import (
    BackgroundJobsServiceInterface,
)
from services.impl.realtime.background_jobs_tasks import (
    CollaborationSessionCleanupJob,
    CRDTSnapshotJob,
)
from utils.logger import get_logger

logger = get_logger(__name__)


class BackgroundJobsScheduler(BackgroundJobsServiceInterface):
    def __init__(
        self,
        crdt_snapshot_interval: int = 300,
        session_cleanup_interval: int = 600,
        tick_interval: int = 10,
    ):
        self._crdt_snapshot_interval = crdt_snapshot_interval
        self._session_cleanup_interval = session_cleanup_interval
        self._tick_interval = tick_interval
        self._running = False
        self._thread: Optional[threading.Thread] = None
        self._snapshot_job = CRDTSnapshotJob()
        self._cleanup_job = CollaborationSessionCleanupJob()

    def start(self) -> None:
        if self._running:
            logger.warning("BackgroundJobsScheduler already running")
            return

        self._running = True
        self._thread = threading.Thread(target=self._run, daemon=True)
        self._thread.start()
        logger.info(
            "BackgroundJobsScheduler started "
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

    def run_crdt_snapshot_job(self) -> None:
        self._snapshot_job.run()

    def run_session_cleanup_job(self) -> None:
        self._cleanup_job.run()

    def _run(self) -> None:
        last_crdt_snapshot = 0.0
        last_session_cleanup = 0.0

        while self._running:
            try:
                current_time = time.monotonic()

                if current_time - last_crdt_snapshot >= self._crdt_snapshot_interval:
                    self.run_crdt_snapshot_job()
                    last_crdt_snapshot = current_time

                if (
                    current_time - last_session_cleanup
                    >= self._session_cleanup_interval
                ):
                    self.run_session_cleanup_job()
                    last_session_cleanup = current_time

                time.sleep(self._tick_interval)

            except Exception as exc:
                logger.error(
                    f"Error in background jobs scheduler: {exc}", exc_info=True
                )
                time.sleep(self._tick_interval)


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
