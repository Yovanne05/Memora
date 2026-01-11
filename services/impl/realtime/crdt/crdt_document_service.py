from typing import Optional

from pycrdt import Doc, Text

from services.interfaces.realtime.crdt_document_service_interface import (
    CRDTDocumentServiceInterface,
)

class CRDTDocumentService(CRDTDocumentServiceInterface):
    def build_document(self, initial_content: Optional[str]) -> Doc:
        doc = Doc()
        doc["content"] = Text()
        if initial_content:
            self._seed_document(doc, initial_content)
        return doc

    def create_from_update(self, update: bytes) -> Doc:
        doc = Doc()
        doc["content"] = Text()
        doc.apply_update(update)
        return doc

    def get_text(self, doc: Doc) -> Optional[str]:
        text = doc.get("content", type=Text)
        if isinstance(text, Text):
            return str(text)
        return None

    def _seed_document(self, doc: Doc, initial_content: str) -> None:
        content = initial_content.strip()
        if not content:
            return
        text = doc.get("content", type=Text)
        if not isinstance(text, Text):
            return
        with doc.transaction():
            text += initial_content
