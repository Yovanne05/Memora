from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from utils.db import Base
from daos.base_models import UUIDMixin, TimestampMixin

if TYPE_CHECKING:
    from daos.flashcard_answer_dao import FlashcardAnswer
    from daos.note_dao import Note


class Flashcard(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "flashcards"
    __table_args__ = (Index("idx_flashcards_note", "note_id"),)

    note_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("notes.id", onupdate="CASCADE", ondelete="CASCADE"),
        nullable=False,
    )
    question: Mapped[str] = mapped_column(Text, nullable=False)

    note: Mapped["Note"] = relationship(back_populates="flashcards")
    answers: Mapped[list["FlashcardAnswer"]] = relationship(
        back_populates="flashcard", cascade="all, delete-orphan"
    )
