from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from daos.base_models import UUIDMixin, CreatedAtMixin, SharePermissionMixin
from utils.db import Base

if TYPE_CHECKING:
    from daos.collection_dao import Collection


class CollectionShareLink(UUIDMixin, SharePermissionMixin, CreatedAtMixin, Base):
    __tablename__ = "collection_share_links"
    __table_args__ = (Index("idx_collection_share_links_collection", "collection_id"),)

    collection_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("collections.id", onupdate="CASCADE", ondelete="CASCADE"),
        nullable=False,
    )

    collection: Mapped["Collection"] = relationship(back_populates="share_links")
