from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, String, Text, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from utils.db import Base
from utils.utils import generate_uuid

if TYPE_CHECKING:
    from daos.flashcard_dao import Flashcard


class FlashcardAnswer(Base):
    __tablename__ = "flashcard_answers"
    __table_args__ = (Index("idx_flashcard_answers_flashcard", "flashcard_id"),)

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    flashcard_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("flashcards.id", onupdate="CASCADE", ondelete="CASCADE"),
        nullable=False,
    )
    answer_text: Mapped[str] = mapped_column(Text, nullable=False)
    is_correct: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default=text("FALSE")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP")
    )

    flashcard: Mapped["Flashcard"] = relationship(back_populates="answers")
