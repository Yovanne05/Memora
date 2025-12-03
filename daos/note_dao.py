from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Index,
    String,
    Text,
    UniqueConstraint,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from utils.enums import SharePermissionEnum, VisibilityEnum
from utils.db import Base
from utils.utils import generate_uuid

from daos.flashcard_dao import Flashcard

if TYPE_CHECKING:
    from daos.collection_dao import Collection
    from daos.user_dao import User


class Note(Base):
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

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    collection_id: Mapped[str | None] = mapped_column(
        String(36),
        ForeignKey("collections.id", onupdate="CASCADE", ondelete="CASCADE"),
        nullable=True,
    )
    owner_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", onupdate="CASCADE", ondelete="CASCADE"),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    visibility: Mapped[VisibilityEnum] = mapped_column(
        SAEnum(
            VisibilityEnum,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
            name="visibilityenum",
            validate_strings=True,
        ),
        nullable=False,
        server_default=text("'private'"),
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP")
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
        server_onupdate=text("CURRENT_TIMESTAMP"),
    )

    collection: Mapped["Collection | None"] = relationship(
        back_populates="notes", lazy="selectin"
    )
    owner: Mapped["User"] = relationship(back_populates="notes", lazy="selectin")
    shares: Mapped[list["NoteShare"]] = relationship(back_populates="note")
    flashcards: Mapped[list["Flashcard"]] = relationship(back_populates="note")
    outgoing_links: Mapped[list["NoteLink"]] = relationship(
        foreign_keys=lambda: [NoteLink.note_id_1],
        back_populates="source_note",
    )
    incoming_links: Mapped[list["NoteLink"]] = relationship(
        foreign_keys=lambda: [NoteLink.note_id_2],
        back_populates="target_note",
    )


class NoteShare(Base):
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
    permission: Mapped[SharePermissionEnum] = mapped_column(
        SAEnum(
            SharePermissionEnum,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
            name="sharepermissionenum",
            validate_strings=True,
        ),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP")
    )

    note: Mapped["Note"] = relationship(back_populates="shares")
    user: Mapped["User"] = relationship(back_populates="note_shares")


class NoteLink(Base):
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
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP")
    )

    source_note: Mapped["Note"] = relationship(
        foreign_keys=[note_id_1], back_populates="outgoing_links"
    )
    target_note: Mapped["Note"] = relationship(
        foreign_keys=[note_id_2], back_populates="incoming_links"
    )
