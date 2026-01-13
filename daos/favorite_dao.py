from sqlalchemy import ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column

from utils.db import Base
from daos.base_models import CreatedAtMixin


class NoteFavorite(CreatedAtMixin, Base):
    __tablename__ = "note_favorites"
    __table_args__ = (Index("idx_note_favorites_user", "user_id"),)

    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", onupdate="CASCADE", ondelete="CASCADE"),
        primary_key=True,
    )
    note_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("notes.id", onupdate="CASCADE", ondelete="CASCADE"),
        primary_key=True,
    )


class CollectionFavorite(CreatedAtMixin, Base):
    __tablename__ = "collection_favorites"
    __table_args__ = (Index("idx_collection_favorites_user", "user_id"),)

    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", onupdate="CASCADE", ondelete="CASCADE"),
        primary_key=True,
    )
    collection_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("collections.id", onupdate="CASCADE", ondelete="CASCADE"),
        primary_key=True,
    )
