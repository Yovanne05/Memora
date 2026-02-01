from typing import TYPE_CHECKING

from sqlalchemy import (
    CheckConstraint,
    Enum as SAEnum,
    ForeignKey,
    Index,
    String,
    Text,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from daos.base_models import UUIDMixin, TimestampMixin
from utils.db import Base
from utils.enums import ReportReasonEnum, ReportStatusEnum

if TYPE_CHECKING:
    from daos.note_dao import Note
    from daos.collection_dao import Collection
    from daos.user_dao import User


class Report(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "reports"
    __table_args__ = (
        CheckConstraint(
            "(note_id IS NOT NULL AND collection_id IS NULL) OR "
            "(note_id IS NULL AND collection_id IS NOT NULL)",
            name="chk_reports_single_target",
        ),
        Index("idx_reports_note", "note_id"),
        Index("idx_reports_collection", "collection_id"),
        Index("idx_reports_status", "status"),
        Index("idx_reports_reporter", "reporter_id"),
    )

    note_id: Mapped[str | None] = mapped_column(
        String(36),
        ForeignKey("notes.id", onupdate="CASCADE", ondelete="CASCADE"),
        nullable=True,
    )
    collection_id: Mapped[str | None] = mapped_column(
        String(36),
        ForeignKey("collections.id", onupdate="CASCADE", ondelete="CASCADE"),
        nullable=True,
    )
    reporter_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", onupdate="CASCADE", ondelete="CASCADE"),
        nullable=False,
    )
    reason: Mapped[ReportReasonEnum] = mapped_column(
        SAEnum(
            ReportReasonEnum,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
            name="report_reason_enum",
            validate_strings=True,
        ),
        nullable=False,
    )
    status: Mapped[ReportStatusEnum] = mapped_column(
        SAEnum(
            ReportStatusEnum,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
            name="report_status_enum",
            validate_strings=True,
        ),
        nullable=False,
        server_default=text("'pending'"),
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    note: Mapped["Note | None"] = relationship(back_populates="reports", lazy="selectin")
    collection: Mapped["Collection | None"] = relationship(back_populates="reports", lazy="selectin")
    reporter: Mapped["User"] = relationship(lazy="selectin")
