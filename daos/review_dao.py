from typing import TYPE_CHECKING
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import Boolean, Enum as SAEnum, ForeignKey, Index, Integer, DECIMAL, String, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship

from utils.db import Base
from utils.enums import ReviewDifficultyEnum

if TYPE_CHECKING:
    from daos.user_dao import User
    from daos.flashcard_dao import Flashcard
    from daos.flashcard_answer_dao import FlashcardAnswer


class Review(Base):
    __tablename__ = "reviews"
    __table_args__ = (
        Index("idx_reviews_user", "user_id"),
        Index("idx_reviews_flashcard", "flashcard_id"),
        Index("idx_reviews_next_review", "user_id", "next_review_at"),
        Index("idx_reviews_reviewed_at", "user_id", "reviewed_at"),
    )

    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", onupdate="CASCADE", ondelete="CASCADE"),
        primary_key=True,
    )
    flashcard_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("flashcards.id", onupdate="CASCADE", ondelete="CASCADE"),
        primary_key=True,
    )
    selected_answer_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("flashcard_answers.id", onupdate="CASCADE", ondelete="CASCADE"),
        nullable=False,
    )
    is_correct: Mapped[bool] = mapped_column(Boolean, nullable=False)
    difficulty: Mapped[ReviewDifficultyEnum] = mapped_column(
        SAEnum(
            ReviewDifficultyEnum,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
            name="review_difficulty_enum",
            validate_strings=True,
        ),
        nullable=False,
    )
    e_factor: Mapped[Decimal] = mapped_column(DECIMAL(4, 2), nullable=False, default=Decimal("2.5"))
    repetitions: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    interval_days: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    next_review_at: Mapped[datetime] = mapped_column(TIMESTAMP, nullable=False)
    reviewed_at: Mapped[datetime] = mapped_column(TIMESTAMP, nullable=False, default=lambda: datetime.now(timezone.utc))

    user: Mapped["User"] = relationship(back_populates="reviews")
    flashcard: Mapped["Flashcard"] = relationship()
    selected_answer: Mapped["FlashcardAnswer"] = relationship()
