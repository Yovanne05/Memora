from __future__ import annotations

from enum import Enum, auto
from typing import Iterable, Optional, Set

from flask import g
from sqlalchemy import or_, select

from daos.collection_dao import Collection
from daos.note_dao import Note
from daos.note_dao import NoteShare
from daos.collection_dao import CollectionShare
from utils.db import get_db_session
from utils.enums import RoleEnum, VisibilityEnum


class AccessLevel(Enum):
    NONE = 0
    READ = auto()
    WRITE = auto()
    OWNER = auto()
    ADMIN = auto()


def _is_admin_user(user) -> bool:
    return user.role in {RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN}


def _cached(name: str, loader):
    if hasattr(g, name):
        return getattr(g, name)
    value = loader()
    setattr(g, name, value)
    return value


def accessible_collection_ids(user) -> Optional[Set[str]]:
    """
    Returns the set of collection ids the user can read.
    Includes ownership, public collections, and direct shares. None means full access (admin).
    """
    if _is_admin_user(user):
        return None

    def _load():
        with get_db_session() as session:
            stmt = (
                select(Collection.id)
                .outerjoin(
                    CollectionShare,
                    CollectionShare.collection_id == Collection.id,
                )
                .where(
                    or_(
                        Collection.owner_id == user.id,
                        Collection.visibility == VisibilityEnum.PUBLIC,
                        CollectionShare.user_id == user.id,
                    )
                )
            )
            return set(session.scalars(stmt).all())

    return _cached("accessible_collection_ids", _load)


def accessible_note_ids(user) -> Optional[Set[str]]:
    """
    Returns the set of note ids the user can read.
    Includes ownership, public notes, direct note shares, and collection shares. None means full access (admin).
    """
    if _is_admin_user(user):
        return None

    def _load():
        with get_db_session() as session:
            stmt = (
                select(Note.id)
                .outerjoin(NoteShare, NoteShare.note_id == Note.id)
                .outerjoin(Collection, Note.collection_id == Collection.id)
                .outerjoin(
                    CollectionShare,
                    CollectionShare.collection_id == Collection.id,
                )
                .where(
                    or_(
                        Note.owner_id == user.id,
                        Note.visibility == VisibilityEnum.PUBLIC,
                        NoteShare.user_id == user.id,
                        CollectionShare.user_id == user.id,
                        Collection.visibility == VisibilityEnum.PUBLIC,
                        Collection.owner_id == user.id,
                    )
                )
            )
            return set(session.scalars(stmt).all())

    return _cached("accessible_note_ids", _load)


def collection_permission(user, collection_id: str) -> AccessLevel:
    if _is_admin_user(user):
        return AccessLevel.ADMIN

    accessible_ids = accessible_collection_ids(user)
    if accessible_ids is None or collection_id in accessible_ids:
        return AccessLevel.OWNER
    return AccessLevel.NONE


def note_permission(user, note_id: str) -> AccessLevel:
    if _is_admin_user(user):
        return AccessLevel.ADMIN

    accessible_ids = accessible_note_ids(user)
    if accessible_ids is None or note_id in accessible_ids:
        return AccessLevel.OWNER
    return AccessLevel.NONE


# Placeholder helpers for future inheritance/expansion to shares.
def note_read_ids_for_collections(collection_ids: Iterable[str]) -> Set[str]:
    """Given collection ids, return readable note ids (owner-only baseline)."""
    with get_db_session() as session:
        stmt = select(Note.id).where(Note.collection_id.in_(collection_ids))
        return set(session.scalars(stmt).all())


def can_read_note(user, note_id: str) -> bool:
    return note_permission(user, note_id) != AccessLevel.NONE


def can_read_collection(user, collection_id: str) -> bool:
    return collection_permission(user, collection_id) != AccessLevel.NONE


def can_read_flashcard(user, note_id: str) -> bool:
    # Flashcards inherit read access from their parent note.
    return can_read_note(user, note_id)


def can_read_note_image(user, note_id: str) -> bool:
    # Note images inherit read access from the note.
    return can_read_note(user, note_id)


def can_read_note_links(user, note_id: str) -> bool:
    # Access to note links requires access to the base note.
    return can_read_note(user, note_id)


def can_write_note(user, note) -> bool:
    """Write access is limited to the owner or admins."""
    return _is_admin_user(user) or getattr(note, "owner_id", None) == getattr(user, "id", None)