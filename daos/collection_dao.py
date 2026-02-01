from typing import TYPE_CHECKING

from sqlalchemy import (
    ForeignKey,
    Index,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from utils.db import Base
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
    from daos.note_dao import Note
    from daos.user_dao import User
    from daos.report_dao import Report


class Collection(
    UUIDMixin,
    OwnerMixin,
    VisibilityMixin,
    TagsMixin,
    TimestampMixin,
    Base,
):
    __tablename__ = "collections"
    __table_args__ = (
        UniqueConstraint(
            "owner_id",
            "name",
            name="uniq_collection_name_per_owner",
        ),
    )

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)

    owner: Mapped["User"] = relationship(back_populates="collections")
    notes: Mapped[list["Note"]] = relationship(
        back_populates="collection",
        lazy="selectin",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    shares: Mapped[list["CollectionShare"]] = relationship(
        back_populates="collection",
        lazy="selectin",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    share_links: Mapped[list["CollectionShareLink"]] = relationship(
        back_populates="collection",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    reports: Mapped[list["Report"]] = relationship(
        back_populates="collection",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class CollectionShare(SharePermissionMixin, CreatedAtMixin, Base):
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

    collection: Mapped["Collection"] = relationship(back_populates="shares")
    user: Mapped["User"] = relationship(back_populates="collection_shares", lazy="selectin")
