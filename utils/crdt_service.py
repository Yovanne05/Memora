from typing import Dict, Optional
import json
from pycrdt import Doc, Text


class CRDTService:
    def __init__(self):
        self._documents: Dict[str, Doc] = {}

    def get_or_create_document(self, note_id: str, initial_content: Optional[str] = None) -> Doc:
        if note_id not in self._documents:
            doc = Doc()
            text = Text()
            doc["content"] = text
            if initial_content:
                self._seed_document(doc, text, initial_content)

            self._documents[note_id] = doc

        return self._documents[note_id]

    def get_document(self, note_id: str) -> Optional[Doc]:
        return self._documents.get(note_id)

    def delete_document(self, note_id: str) -> bool:
        if note_id in self._documents:
            del self._documents[note_id]
            return True
        return False

    def get_content_as_text(self, note_id: str) -> str:
        doc = self.get_document(note_id)
        if doc is None:
            raise ValueError(f"CRDT document not found for note {note_id}")

        text = doc.get("content", type=Text)
        if isinstance(text, Text):
            return str(text)
        return ""

    def apply_update(self, note_id: str, update: bytes) -> None:
        doc = self.get_document(note_id)
        if doc is None:
            raise ValueError(f"CRDT document not found for note {note_id}")

        doc.apply_update(update)

    def get_state_vector(self, note_id: str) -> bytes:
        doc = self.get_document(note_id)
        if doc is None:
            raise ValueError(f"CRDT document not found for note {note_id}")
        return doc.get_state()

    def get_update_since_state(self, note_id: str, state_vector: bytes) -> bytes:
        doc = self.get_document(note_id)
        if doc is None:
            raise ValueError(f"CRDT document not found for note {note_id}")
        return doc.get_update(state_vector)

    def _seed_document(self, doc: Doc, text: Text, initial_content: str) -> None:
        content = initial_content.strip()
        if not content:
            return

        if content.startswith("{"):
            try:
                content_data = json.loads(content)
            except json.JSONDecodeError:
                content_data = None

            if isinstance(content_data, dict):
                text_content = self._extract_text_from_tiptap(content_data)
                if text_content:
                    with doc.transaction():
                        text += text_content
                return

        with doc.transaction():
            text += initial_content

    def _extract_text_from_tiptap(self, tiptap_json: dict) -> str:
        if not isinstance(tiptap_json, dict):
            return ""

        text_parts = []

        def extract_recursive(node):
            if isinstance(node, dict):
                if "text" in node:
                    text_parts.append(node["text"])
                if "content" in node and isinstance(node["content"], list):
                    for child in node["content"]:
                        extract_recursive(child)

        extract_recursive(tiptap_json)
        return "".join(text_parts)


_crdt_service: Optional[CRDTService] = None


def get_crdt_service() -> CRDTService:
    global _crdt_service
    if _crdt_service is None:
        _crdt_service = CRDTService()
    return _crdt_service


def init_crdt_service() -> CRDTService:
    global _crdt_service
    _crdt_service = CRDTService()
    return _crdt_service
