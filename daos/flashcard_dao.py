from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from utils.db import Base
from utils.utils import generate_uuid

if TYPE_CHECKING:
    from daos.note_dao import Note


class Flashcard(Base):
    __tablename__ = "flashcards"
    __table_args__ = (Index("idx_flashcards_note", "note_id"),)

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    note_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("notes.id", onupdate="CASCADE", ondelete="CASCADE"),
        nullable=False,
    )
    question: Mapped[str] = mapped_column(Text, nullable=False)
    answer: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP")
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
        server_onupdate=text("CURRENT_TIMESTAMP"),
    )

    note: Mapped["Note"] = relationship(back_populates="flashcards")
