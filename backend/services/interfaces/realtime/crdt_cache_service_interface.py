from typing import Optional, Protocol

from pycrdt import Doc


class CRDTCacheServiceInterface(Protocol):
    def load(self, note_id: str) -> Optional[Doc]:
        ...

    def save(self, note_id: str, doc: Doc) -> None:
        ...

    def delete(self, note_id: str) -> None:
        ...
