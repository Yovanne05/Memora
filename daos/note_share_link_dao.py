from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from daos.base_models import UUIDMixin, CreatedAtMixin, SharePermissionMixin
from utils.db import Base

if TYPE_CHECKING:
    from daos.note_dao import Note


class NoteShareLink(UUIDMixin, SharePermissionMixin, CreatedAtMixin, Base):
    __tablename__ = "note_share_links"
    __table_args__ = (Index("idx_note_share_links_note", "note_id"),)

    note_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("notes.id", onupdate="CASCADE", ondelete="CASCADE"),
        nullable=False,
    )

    note: Mapped["Note"] = relationship(back_populates="share_links")
