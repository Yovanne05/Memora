from typing import Protocol


class BackgroundJobsServiceInterface(Protocol):
    def start(self) -> None:
        ...

    def stop(self) -> None:
        ...

    def run_crdt_snapshot_job(self) -> None:
        ...

    def run_session_cleanup_job(self) -> None:
        ...
