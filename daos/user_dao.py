from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum as SAEnum, String, Text, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from utils.db import Base
from utils.enums import RoleEnum
from utils.utils import generate_uuid

from daos.collection_dao import Collection, CollectionShare
from daos.note_dao import Note, NoteShare


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )
    email: Mapped[str] = mapped_column(
        String(255), nullable=False, unique=True)
    username: Mapped[str | None] = mapped_column(String(50), unique=True)
    display_name: Mapped[str | None] = mapped_column(String(100))
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    role: Mapped[RoleEnum] = mapped_column(
        SAEnum(
            RoleEnum,
            values_callable=lambda enum_cls: [
                member.value for member in enum_cls],
            name="roleenum",
            validate_strings=True,
        ),
        nullable=False,
        server_default=text("'client'"),
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP")
    )
    last_login: Mapped[datetime | None] = mapped_column(
        DateTime, nullable=True
    )

    collections: Mapped[list["Collection"]] = relationship(
        back_populates="owner"
    )
    notes: Mapped[list["Note"]] = relationship(back_populates="owner")
    collection_shares: Mapped[list["CollectionShare"]] = relationship(
        back_populates="user"
    )
    note_shares: Mapped[list["NoteShare"]] = relationship(
        back_populates="user"
    )
