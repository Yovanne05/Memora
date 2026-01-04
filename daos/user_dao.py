from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum as SAEnum, String, Text, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from utils.db import Base
from utils.enums import RoleEnum
from daos.base_models import UUIDMixin, CreatedAtMixin

from daos.collection_dao import Collection, CollectionShare
from daos.note_dao import Note, NoteShare

if TYPE_CHECKING:
    from daos.review_dao import Review


class User(UUIDMixin, CreatedAtMixin, Base):
    __tablename__ = "users"

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
    reviews: Mapped[list["Review"]] = relationship(back_populates="user")
