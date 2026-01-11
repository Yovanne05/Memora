from typing import TYPE_CHECKING

from sqlalchemy import (
    ForeignKey,
    Index,
    String,
    Text,
    UniqueConstraint,
    text
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from utils.db import Base
from daos.flashcard_dao import Flashcard
from daos.base_models import (
    UUIDMixin,
    TimestampMixin,
    CreatedAtMixin,
    VisibilityMixin,
    TagsMixin,
    OwnerMixin,
    SharePermissionMixin,
)

if TYPE_CHECKING:
    from daos.collection_dao import Collection
    from daos.user_dao import User
    from daos.report_dao import Report


class Note(
    UUIDMixin,
    OwnerMixin,
    VisibilityMixin,
    TagsMixin,
    TimestampMixin,
    Base,
):
    __tablename__ = "notes"
    __table_args__ = (
        UniqueConstraint(
            "collection_id",
            "title",
            name="uniq_note_title_per_collection",
        ),
        Index("idx_notes_collection", "collection_id"),
        Index("idx_notes_owner", "owner_id"),
    )

    collection_id: Mapped[str | None] = mapped_column(
        String(36),
        ForeignKey("collections.id", onupdate="CASCADE", ondelete="CASCADE"),
        nullable=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False, server_default=text("''"))
    collection: Mapped["Collection | None"] = relationship(
        back_populates="notes", lazy="selectin"
    )
    owner: Mapped["User"] = relationship(back_populates="notes", lazy="selectin")
    shares: Mapped[list["NoteShare"]] = relationship(
        back_populates="note",
        cascade="all, delete-orphan",
        passive_deletes=True,
        lazy="selectin",
    )
    share_links: Mapped[list["NoteShareLink"]] = relationship(
        back_populates="note",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    flashcards: Mapped[list["Flashcard"]] = relationship(
        back_populates="note", passive_deletes=True
    )
    outgoing_links: Mapped[list["NoteLink"]] = relationship(
        foreign_keys=lambda: [NoteLink.note_id_1],
        back_populates="source_note",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    incoming_links: Mapped[list["NoteLink"]] = relationship(
        foreign_keys=lambda: [NoteLink.note_id_2],
        back_populates="target_note",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    reports: Mapped[list["Report"]] = relationship(
        back_populates="note",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class NoteShare(SharePermissionMixin, CreatedAtMixin, Base):
    __tablename__ = "note_shares"
    __table_args__ = (Index("idx_note_shares_user", "user_id"),)

    note_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("notes.id", onupdate="CASCADE", ondelete="CASCADE"),
        primary_key=True,
    )
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", onupdate="CASCADE", ondelete="CASCADE"),
        primary_key=True,
    )

    note: Mapped["Note"] = relationship(back_populates="shares")
    user: Mapped["User"] = relationship(back_populates="note_shares", lazy="selectin")


class NoteLink(CreatedAtMixin, Base):
    __tablename__ = "note_links"
    __table_args__ = (
        Index("idx_note_links_note1", "note_id_1"),
        Index("idx_note_links_note2", "note_id_2"),
    )

    note_id_1: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("notes.id", onupdate="CASCADE", ondelete="CASCADE"),
        primary_key=True,
    )
    note_id_2: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("notes.id", onupdate="CASCADE", ondelete="CASCADE"),
        primary_key=True,
    )

    label: Mapped[str] = mapped_column(String(255), nullable=False)

    source_note: Mapped["Note"] = relationship(
        foreign_keys=[note_id_1], back_populates="outgoing_links"
    )
    target_note: Mapped["Note"] = relationship(
        foreign_keys=[note_id_2], back_populates="incoming_links"
    )
