from datetime import datetime
from sqlalchemy import DateTime, String, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from utils.db import Base
from utils.utils import generate_uuid


class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP")
    )

    collection_links: Mapped[list["CollectionTag"]] = relationship(
        back_populates="tag"
    )
    note_links: Mapped[list["NoteTag"]] = relationship(
        back_populates="tag"
    )
