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

    with get_db_session() as session:
        collection = session.query(Collection).filter(Collection.id == collection_id).first()
        if not collection:
            return AccessLevel.NONE

        if collection.owner_id == user.id:
            return AccessLevel.OWNER

        share = session.query(CollectionShare).filter(
            CollectionShare.collection_id == collection_id,
            CollectionShare.user_id == user.id
        ).first()

        if share:
            from utils.enums import SharePermissionEnum
            if share.permission == SharePermissionEnum.OWNER:
                return AccessLevel.OWNER
            elif share.permission == SharePermissionEnum.WRITE:
                return AccessLevel.WRITE
            else:
                return AccessLevel.READ

        if collection.visibility == VisibilityEnum.PUBLIC:
            return AccessLevel.READ

        return AccessLevel.NONE


def _share_permission_to_access_level(permission) -> AccessLevel:
    from utils.enums import SharePermissionEnum
    if permission == SharePermissionEnum.OWNER:
        return AccessLevel.OWNER
    elif permission == SharePermissionEnum.WRITE:
        return AccessLevel.WRITE
    return AccessLevel.READ


def _check_note_share_permission(session, note_id: str, user_id: str) -> AccessLevel:
    note_share = session.query(NoteShare).filter(
        NoteShare.note_id == note_id,
        NoteShare.user_id == user_id
    ).first()
    return _share_permission_to_access_level(note_share.permission) if note_share else AccessLevel.NONE


def _check_collection_share_permission(session, collection_id: str, user_id: str) -> AccessLevel:
    collection_share = session.query(CollectionShare).filter(
        CollectionShare.collection_id == collection_id,
        CollectionShare.user_id == user_id
    ).first()
    if collection_share:
        return _share_permission_to_access_level(collection_share.permission)

    collection = session.query(Collection).filter(Collection.id == collection_id).first()
    if collection and collection.visibility == VisibilityEnum.PUBLIC:
        return AccessLevel.READ

    return AccessLevel.NONE


def note_permission(user, note_id: str) -> AccessLevel:
    if _is_admin_user(user):
        return AccessLevel.ADMIN

    with get_db_session() as session:
        note = session.query(Note).filter(Note.id == note_id).first()
        if not note:
            return AccessLevel.NONE

        if note.owner_id == user.id:
            return AccessLevel.OWNER

        share_level = _check_note_share_permission(session, note_id, user.id)
        if share_level != AccessLevel.NONE:
            return share_level

        if note.collection_id:
            collection_level = _check_collection_share_permission(session, note.collection_id, user.id)
            if collection_level != AccessLevel.NONE:
                return collection_level

        if note.visibility == VisibilityEnum.PUBLIC:
            return AccessLevel.READ

        return AccessLevel.NONE


def note_read_ids_for_collections(collection_ids: Iterable[str]) -> Set[str]:
    with get_db_session() as session:
        stmt = select(Note.id).where(Note.collection_id.in_(collection_ids))
        return set(session.scalars(stmt).all())


def can_read_note(user, note_id: str) -> bool:
    return note_permission(user, note_id) != AccessLevel.NONE


def can_read_collection(user, collection_id: str) -> bool:
    return collection_permission(user, collection_id) != AccessLevel.NONE


def can_read_flashcard(user, note_id: str) -> bool:
    return can_read_note(user, note_id)


def can_read_note_image(user, note_id: str) -> bool:
    return can_read_note(user, note_id)


def can_read_note_links(user, note_id: str) -> bool:
    return can_read_note(user, note_id)


def can_write_note(user, note_id: str) -> bool:
    level = note_permission(user, note_id)
    return level in {AccessLevel.WRITE, AccessLevel.OWNER, AccessLevel.ADMIN}


def can_write_collection(user, collection_id: str) -> bool:
    level = collection_permission(user, collection_id)
    return level in {AccessLevel.WRITE, AccessLevel.OWNER, AccessLevel.ADMIN}


def is_note_owner(user, note_id: str) -> bool:
    level = note_permission(user, note_id)
    return level in {AccessLevel.OWNER, AccessLevel.ADMIN}


def is_collection_owner(user, collection_id: str) -> bool:
    level = collection_permission(user, collection_id)
    return level in {AccessLevel.OWNER, AccessLevel.ADMIN}
