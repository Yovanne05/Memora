"""
Service CRDT pour la collaboration temps réel.

Ce service utilise pycrdt (Yjs/Yrs) pour gérer les documents collaboratifs
avec résolution automatique des conflits.
"""

from typing import Dict, Optional
from pycrdt import Doc, Text
import json
from utils.logger import get_logger

logger = get_logger(__name__)


class CRDTService:
    """Service de gestion des documents CRDT pour la collaboration."""

    def __init__(self):
        # Stockage des documents CRDT en mémoire (note_id -> Doc)
        self._documents: Dict[str, Doc] = {}

    def get_or_create_document(self, note_id: str, initial_content: Optional[str] = None) -> Doc:
        """
        Récupère ou crée un document CRDT pour une note.

        Args:
            note_id: Identifiant de la note
            initial_content: Contenu initial (format JSON Tiptap ou texte brut)

        Returns:
            Document CRDT
        """
        if note_id not in self._documents:
            doc = Doc()

            # Créer un objet Text CRDT
            text = Text()

            # IMPORTANT: Insérer le Text dans le Doc AVANT d'y ajouter du contenu
            doc["content"] = text

            # Maintenant, initialiser avec le contenu si fourni
            if initial_content:
                try:
                    # Si c'est du JSON Tiptap, extraire le texte brut pour l'instant
                    # TODO: Supporter pleinement le format JSON de Tiptap
                    if initial_content.strip().startswith("{"):
                        content_data = json.loads(initial_content)
                        # Extraction basique du texte depuis le JSON Tiptap
                        text_content = self._extract_text_from_tiptap(content_data)
                        with doc.transaction():
                            text += text_content
                    else:
                        with doc.transaction():
                            text += initial_content
                except (json.JSONDecodeError, KeyError) as e:
                    logger.warning(f"Could not parse initial content as JSON: {e}")
                    if initial_content:
                        with doc.transaction():
                            text += initial_content

            self._documents[note_id] = doc
            logger.info(f"Created new CRDT document for note {note_id}")

        return self._documents[note_id]

    def get_document(self, note_id: str) -> Optional[Doc]:
        """
        Récupère un document CRDT existant.

        Args:
            note_id: Identifiant de la note

        Returns:
            Document CRDT ou None si non trouvé
        """
        return self._documents.get(note_id)

    def delete_document(self, note_id: str) -> bool:
        """
        Supprime un document CRDT du cache.

        Args:
            note_id: Identifiant de la note

        Returns:
            True si le document a été supprimé, False sinon
        """
        if note_id in self._documents:
            del self._documents[note_id]
            logger.info(f"Deleted CRDT document for note {note_id}")
            return True
        return False

    def get_content_as_text(self, note_id: str) -> str:
        """
        Récupère le contenu d'un document CRDT sous forme de texte.

        Args:
            note_id: Identifiant de la note

        Returns:
            Contenu textuel du document
        """
        doc = self.get_document(note_id)
        if doc is None:
            return ""

        text = doc.get("content")
        if isinstance(text, Text):
            return str(text)
        return ""

    def apply_update(self, note_id: str, update: bytes) -> None:
        """
        Applique une mise à jour CRDT au document.

        Args:
            note_id: Identifiant de la note
            update: Mise à jour encodée (format Yjs binary)
        """
        doc = self.get_document(note_id)
        if doc is None:
            logger.error(f"Cannot apply update: document {note_id} not found")
            return

        try:
            doc.apply_update(update)
            logger.debug(f"Applied CRDT update to note {note_id}")
        except Exception as e:
            logger.error(f"Error applying CRDT update to note {note_id}: {e}")
            raise

    def get_state_vector(self, note_id: str) -> bytes:
        """
        Récupère le vecteur d'état d'un document CRDT.

        Le vecteur d'état représente l'état actuel du document et permet
        de calculer les différences (deltas) pour la synchronisation.

        Args:
            note_id: Identifiant de la note

        Returns:
            Vecteur d'état encodé
        """
        doc = self.get_document(note_id)
        if doc is None:
            return bytes()

        return doc.get_state()

    def get_update_since_state(self, note_id: str, state_vector: bytes) -> bytes:
        """
        Calcule les mises à jour nécessaires depuis un état donné.

        Args:
            note_id: Identifiant de la note
            state_vector: Vecteur d'état à partir duquel calculer les différences

        Returns:
            Mises à jour encodées
        """
        doc = self.get_document(note_id)
        if doc is None:
            return bytes()

        try:
            return doc.get_update(state_vector)
        except Exception as e:
            logger.error(f"Error getting update for note {note_id}: {e}")
            return bytes()

    def _extract_text_from_tiptap(self, tiptap_json: dict) -> str:
        """
        Extrait le texte brut depuis un document JSON Tiptap.

        Note: Cette fonction est une implémentation basique.
        Pour un support complet de Tiptap, il faudrait gérer tous les types de nœuds.

        Args:
            tiptap_json: Document Tiptap au format JSON

        Returns:
            Texte brut extrait
        """
        if not isinstance(tiptap_json, dict):
            return ""

        text_parts = []

        def extract_recursive(node):
            if isinstance(node, dict):
                # Si le nœud a du texte, l'ajouter
                if "text" in node:
                    text_parts.append(node["text"])

                # Si le nœud a des enfants, les parcourir récursivement
                if "content" in node and isinstance(node["content"], list):
                    for child in node["content"]:
                        extract_recursive(child)

        extract_recursive(tiptap_json)
        return "".join(text_parts)


# Instance globale du service CRDT
_crdt_service: Optional[CRDTService] = None


def get_crdt_service() -> CRDTService:
    """
    Récupère l'instance globale du service CRDT.

    Returns:
        Instance du service CRDT
    """
    global _crdt_service
    if _crdt_service is None:
        _crdt_service = CRDTService()
    return _crdt_service


def init_crdt_service() -> CRDTService:
    """
    Initialise le service CRDT.

    Returns:
        Instance du service CRDT
    """
    global _crdt_service
    _crdt_service = CRDTService()
    logger.info("CRDT service initialized")
    return _crdt_service
