from sqlalchemy import ForeignKey, Index, Integer, String, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from utils.db import Base
from daos.base_models import UUIDMixin, CreatedAtMixin


class NoteImage(UUIDMixin, CreatedAtMixin, Base):
    __tablename__ = "note_images"
    __table_args__ = (
        Index("idx_note_images_note_id", "note_id"),
    )

    note_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("notes.id", onupdate="CASCADE", ondelete="CASCADE"),
        nullable=False,
    )
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(512), nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    uploaded_at: Mapped[str] = mapped_column(DateTime, nullable=False)
