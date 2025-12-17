"""Common mixins for SQLAlchemy DAO models"""
from datetime import datetime

from sqlalchemy import (
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    String,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column

from utils.db_types import StringArray
from utils.enums import SharePermissionEnum, VisibilityEnum
from utils.utils import generate_uuid


class UUIDMixin:
    """Mixin for models with UUID primary key"""

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=generate_uuid
    )


class TimestampMixin:
    """Mixin for models with created_at and updated_at timestamps"""

    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP")
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
        server_onupdate=text("CURRENT_TIMESTAMP"),
    )


class CreatedAtMixin:
    """Mixin for models with only created_at timestamp"""

    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=text("CURRENT_TIMESTAMP")
    )


class VisibilityMixin:
    """Mixin for models with visibility field"""

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


class TagsMixin:
    """Mixin for models with tags array field"""

    tags: Mapped[list[str]] = mapped_column(
        StringArray,
        nullable=False,
        server_default=text("'{}'"),
    )


class OwnerMixin:
    """Mixin for models with owner_id foreign key"""

    owner_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", onupdate="CASCADE", ondelete="CASCADE"),
        nullable=False,
    )


class SharePermissionMixin:
    """Mixin for share models with permission field"""

    permission: Mapped[SharePermissionEnum] = mapped_column(
        SAEnum(
            SharePermissionEnum,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
            name="sharepermissionenum",
            validate_strings=True,
        ),
        nullable=False,
    )
