from sqlalchemy import ForeignKey, String, LargeBinary, Index, text
from sqlalchemy.orm import Mapped, mapped_column

from utils.db import Base
from daos.base_models import UUIDMixin, TimestampMixin


class CRDTSnapshot(UUIDMixin, TimestampMixin, Base):
    """
    Stocke les snapshots CRDT des notes pour persistance et récupération.

    Permet de :
    - Récupérer l'état CRDT après redémarrage serveur
    - Supporter le scaling horizontal (plusieurs instances)
    - Éviter la perte de données en cas de crash
    """
    __tablename__ = "crdt_snapshots"
    __table_args__ = (
        Index("idx_crdt_snapshots_note", "note_id"),
    )

    note_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("notes.id", onupdate="CASCADE", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        comment="ID de la note associée"
    )

    state_vector: Mapped[bytes] = mapped_column(
        LargeBinary,
        nullable=False,
        comment="Vecteur d'état CRDT (binaire)"
    )

    document_update: Mapped[bytes] = mapped_column(
        LargeBinary,
        nullable=False,
        comment="Mise à jour complète du document CRDT (binaire)"
    )

    version: Mapped[int] = mapped_column(
        nullable=False,
        server_default=text("0"),
        comment="Version du snapshot pour gestion de conflits"
    )
