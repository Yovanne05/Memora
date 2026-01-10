from typing import Dict, Optional
import base64
from datetime import timedelta
from pycrdt import Doc, Text

from utils.logger import get_logger

logger = get_logger(__name__)


class CRDTService:
    """
    Service de gestion des documents CRDT avec persistance Redis et PostgreSQL.

    Architecture de persistance :
    - RAM : Cache in-memory pour performances (self._documents)
    - Redis : Cache distribué avec TTL (24h)
    - PostgreSQL : Persistance long-terme via snapshots

    Flux de récupération :
    1. Cherche en RAM → si trouvé, retourne
    2. Cherche en Redis → si trouvé, charge en RAM et retourne
    3. Cherche en PostgreSQL → si trouvé, charge en Redis + RAM et retourne
    4. Sinon, crée un nouveau document
    """
    def __init__(self, redis_client=None):
        self._documents: Dict[str, Doc] = {}
        self._redis_client = redis_client
        self._redis_ttl = int(timedelta(hours=24).total_seconds())  # 24h

    def get_or_create_document(self, note_id: str, initial_content: Optional[str] = None) -> Doc:
        """
        Récupère ou crée un document CRDT avec stratégie de persistance multi-niveaux.

        Ordre de recherche :
        1. RAM (self._documents)
        2. Redis (cache distribué)
        3. PostgreSQL (snapshots)
        4. Création avec initial_content si fourni
        """
        # 1. Cherche en RAM
        if note_id in self._documents:
            return self._documents[note_id]

        # 2. Cherche en Redis
        doc = self._load_from_redis(note_id)
        if doc is not None:
            self._documents[note_id] = doc
            logger.info(f"CRDT document loaded from Redis: {note_id}")
            return doc

        # 3. Cherche en PostgreSQL
        doc = self._load_from_database(note_id)
        if doc is not None:
            self._documents[note_id] = doc
            self._save_to_redis(note_id, doc)
            logger.info(f"CRDT document loaded from PostgreSQL: {note_id}")
            return doc

        # 4. Crée un nouveau document
        doc = Doc()
        text = Text()
        doc["content"] = text
        if initial_content:
            self._seed_document(doc, text, initial_content)

        self._documents[note_id] = doc
        self._save_to_redis(note_id, doc)
        logger.info(f"CRDT document created: {note_id}")

        return doc

    def get_document(self, note_id: str) -> Optional[Doc]:
        return self._documents.get(note_id)

    def delete_document(self, note_id: str) -> bool:
        """
        Supprime un document de tous les niveaux de cache.
        Note : Le snapshot PostgreSQL reste pour historique.
        """
        deleted = False

        # Supprime de RAM
        if note_id in self._documents:
            del self._documents[note_id]
            deleted = True

        # Supprime de Redis
        if self._redis_client:
            try:
                redis_key = self._get_redis_key(note_id)
                self._redis_client.delete(redis_key)
                logger.info(f"CRDT document deleted from Redis: {note_id}")
            except Exception as e:
                logger.warning(f"Failed to delete CRDT from Redis: {e}")

        return deleted

    def get_content_as_text(self, note_id: str) -> str:
        doc = self.get_document(note_id)
        if doc is None:
            raise ValueError(f"CRDT document not found for note {note_id}")

        text = doc.get("content", type=Text)
        if isinstance(text, Text):
            return str(text)
        return ""

    def apply_update(self, note_id: str, update: bytes) -> None:
        """
        Applique une mise à jour CRDT et persiste dans Redis.
        """
        doc = self.get_document(note_id)
        if doc is None:
            raise ValueError(f"CRDT document not found for note {note_id}")

        doc.apply_update(update)

        # Persiste immédiatement dans Redis après chaque update
        self._save_to_redis(note_id, doc)

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
        with doc.transaction():
            text += initial_content

    def _get_redis_key(self, note_id: str) -> str:
        """Génère la clé Redis pour un document CRDT."""
        return f"crdt:doc:{note_id}"

    def _save_to_redis(self, note_id: str, doc: Doc) -> None:
        """
        Sauvegarde un document CRDT dans Redis.

        Format :
        - Clé : crdt:doc:<note_id>
        - Valeur : state_vector (base64) et document_update (base64) en JSON
        - TTL : 24h
        """
        if not self._redis_client:
            return

        try:
            state_vector = doc.get_state()
            # Encode l'update complet pour pouvoir reconstruire le doc
            document_update = doc.get_update()

            data = {
                "state_vector": base64.b64encode(state_vector).decode('utf-8'),
                "document_update": base64.b64encode(document_update).decode('utf-8'),
            }

            redis_key = self._get_redis_key(note_id)
            self._redis_client.setex(
                redis_key,
                self._redis_ttl,
                json.dumps(data)
            )
        except Exception as e:
            logger.error(f"Failed to save CRDT to Redis for note {note_id}: {e}")

    def _load_from_redis(self, note_id: str) -> Optional[Doc]:
        """
        Charge un document CRDT depuis Redis.
        """
        if not self._redis_client:
            return None

        try:
            redis_key = self._get_redis_key(note_id)
            data_json = self._redis_client.get(redis_key)

            if not data_json:
                return None

            data = json.loads(data_json)
            document_update = base64.b64decode(data["document_update"])

            # Reconstruit le document depuis l'update complète
            doc = Doc()
            doc["content"] = Text()
            doc.apply_update(document_update)

            return doc
        except Exception as e:
            logger.warning(f"Failed to load CRDT from Redis for note {note_id}: {e}")
            return None

    def _load_from_database(self, note_id: str) -> Optional[Doc]:
        try:
            from utils.db import get_db_session
            from daos.crdt_snapshot_dao import CRDTSnapshot

            with get_db_session() as session:
                snapshot = session.query(CRDTSnapshot).filter(
                    CRDTSnapshot.note_id == note_id
                ).first()

                if not snapshot:
                    return None

                # Reconstruit le document depuis le snapshot
                doc = Doc()
                doc["content"] = Text()
                doc.apply_update(snapshot.document_update)

                return doc
        except Exception as e:
            logger.warning(f"Failed to load CRDT from database for note {note_id}: {e}")
            return None

    def save_snapshot_to_database(self, note_id: str) -> bool:
        try:
            from utils.db import get_db_session
            from daos.crdt_snapshot_dao import CRDTSnapshot
            from sqlalchemy import select

            doc = self.get_document(note_id)
            if doc is None:
                logger.warning(f"Cannot save snapshot: document not found for note {note_id}")
                return False

            state_vector = doc.get_state()
            document_update = doc.get_update()

            with get_db_session() as session:
                # Cherche un snapshot existant
                stmt = select(CRDTSnapshot).where(CRDTSnapshot.note_id == note_id)
                snapshot = session.scalar(stmt)

                if snapshot:
                    # Met à jour le snapshot existant
                    snapshot.state_vector = state_vector
                    snapshot.document_update = document_update
                    snapshot.version += 1
                else:
                    # Crée un nouveau snapshot
                    snapshot = CRDTSnapshot(
                        note_id=note_id,
                        state_vector=state_vector,
                        document_update=document_update,
                        version=0
                    )
                    session.add(snapshot)

                session.commit()
                return True

        except Exception as e:
            logger.error(f"Failed to save CRDT snapshot to database for note {note_id}: {e}")
            return False


_crdt_service: Optional[CRDTService] = None


def get_crdt_service() -> CRDTService:
    global _crdt_service
    if _crdt_service is None:
        logger.warning("CRDTService not initialized, creating without Redis client")
        _crdt_service = CRDTService()
    return _crdt_service


def init_crdt_service(redis_client=None) -> CRDTService:
    global _crdt_service
    _crdt_service = CRDTService(redis_client=redis_client)
    return _crdt_service
