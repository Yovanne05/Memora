from typing import Optional, Protocol

from pycrdt import Doc


class CRDTSnapshotServiceInterface(Protocol):
    def load_snapshot(self, note_id: str) -> Optional[Doc]:
        ...

    def save_snapshot(self, note_id: str, doc: Doc) -> bool:
        ...
