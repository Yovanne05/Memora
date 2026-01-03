from typing import TYPE_CHECKING

from sqlalchemy import Enum as SAEnum, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from utils.db import Base
from daos.base_models import UUIDMixin, TimestampMixin
from utils.enums import DifficultyEnum

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
    difficulty: Mapped[DifficultyEnum | None] = mapped_column(
        SAEnum(
            DifficultyEnum,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
            name="difficultyenum",
            validate_strings=True,
        ),
        nullable=True,
    )

    note: Mapped["Note"] = relationship(back_populates="flashcards")
    answers: Mapped[list["FlashcardAnswer"]] = relationship(
        back_populates="flashcard", cascade="all, delete-orphan"
    )
