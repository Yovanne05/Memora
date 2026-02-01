from typing import Optional, Protocol

from pycrdt import Doc


class CRDTDocumentServiceInterface(Protocol):
    def build_document(self, initial_content: Optional[str]) -> Doc:
        ...

    def create_from_update(self, update: bytes) -> Doc:
        ...

    def get_text(self, doc: Doc) -> Optional[str]:
        ...
