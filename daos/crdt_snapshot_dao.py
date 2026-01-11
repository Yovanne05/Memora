from sqlalchemy import ForeignKey, String, LargeBinary, Index, text
from sqlalchemy.orm import Mapped, mapped_column

from utils.db import Base
from daos.base_models import UUIDMixin, TimestampMixin


class CRDTSnapshot(UUIDMixin, TimestampMixin, Base):
    """
    Stores CRDT snapshots for notes to support persistence and recovery.

    Enables:
    - Restoring CRDT state after a server restart
    - Supporting horizontal scaling (multiple instances)
    - Avoiding data loss in case of a crash
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
        comment="Associated note ID"
    )

    state_vector: Mapped[bytes] = mapped_column(
        LargeBinary,
        nullable=False,
        comment="CRDT state vector (binary)"
    )

    document_update: Mapped[bytes] = mapped_column(
        LargeBinary,
        nullable=False,
        comment="Full CRDT document update (binary)"
    )

    version: Mapped[int] = mapped_column(
        nullable=False,
        server_default=text("0"),
        comment="Snapshot version for conflict handling"
    )
