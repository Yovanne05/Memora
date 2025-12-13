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
from utils.db_types import StringArray
from utils.utils import generate_uuid

if TYPE_CHECKING:
    from daos.note_dao import Note
    from daos.user_dao import User


class Collection(Base):
    __tablename__ = "collections"
    __table_args__ = (
        UniqueConstraint(
            "owner_id",
            "name",
            name="uniq_collection_name_per_owner",
        ),
    )

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    owner_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", onupdate="CASCADE", ondelete="CASCADE"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
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
    tags: Mapped[list[str]] = mapped_column(
        StringArray,
        nullable=False,
        server_default=text("'{}'"),
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

    owner: Mapped["User"] = relationship(back_populates="collections")
    notes: Mapped[list["Note"]] = relationship(back_populates="collection", lazy="selectin")
    shares: Mapped[list["CollectionShare"]] = relationship(
        back_populates="collection"
    )


class CollectionShare(Base):
    __tablename__ = "collection_shares"
    __table_args__ = (Index("idx_collection_shares_user", "user_id"),)

    collection_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("collections.id", onupdate="CASCADE", ondelete="CASCADE"),
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

    collection: Mapped["Collection"] = relationship(back_populates="shares")
    user: Mapped["User"] = relationship(back_populates="collection_shares")
