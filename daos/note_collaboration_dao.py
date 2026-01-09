from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from daos.base_models import CreatedAtMixin, UUIDMixin
from utils.db import Base

if TYPE_CHECKING:
    from daos.note_dao import Note
    from daos.user_dao import User


class NoteCollaborationHistory(UUIDMixin, CreatedAtMixin, Base):
    """
    Stores collaboration operation history for audit purposes (optional).

    Real-time collaboration uses Redis for performance.
    This table is only for persistent history/audit trail.
    """

    __tablename__ = "note_collaboration_history"
    __table_args__ = (
        Index("idx_collab_history_note", "note_id"),
        Index("idx_collab_history_created", "created_at"),
    )

    note_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("notes.id", onupdate="CASCADE", ondelete="CASCADE"),
        nullable=False,
    )
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", onupdate="CASCADE", ondelete="CASCADE"),
        nullable=False,
    )
    operation_type: Mapped[str] = mapped_column(String(50), nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    content: Mapped[str] = mapped_column(String(10000), nullable=False, server_default="")
    version: Mapped[int] = mapped_column(Integer, nullable=False)

    note: Mapped["Note"] = relationship()
    user: Mapped["User"] = relationship()
