import threading
from typing import Dict, Optional

from pycrdt import Doc


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
