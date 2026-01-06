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
from utils.enums import RoleEnum, SharePermissionEnum, VisibilityEnum


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


def _get_note_permission_level(user, note_id: str) -> AccessLevel:
    """Get the actual permission level for a note."""
    if _is_admin_user(user):
        return AccessLevel.ADMIN
    
    with get_db_session() as session:
        note = session.get(Note, note_id)
        if not note:
            return AccessLevel.NONE
        
        # Original owner has OWNER level
        if note.owner_id == user.id:
            return AccessLevel.OWNER
        
        # Check direct note share
        note_share = session.execute(
            select(NoteShare).where(
                NoteShare.note_id == note_id,
                NoteShare.user_id == user.id
            )
        ).scalar_one_or_none()
        
        if note_share:
            if note_share.permission == SharePermissionEnum.OWNER:
                return AccessLevel.OWNER
            elif note_share.permission == SharePermissionEnum.WRITE:
                return AccessLevel.WRITE
            elif note_share.permission == SharePermissionEnum.READ:
                return AccessLevel.READ
        
        # Check collection share if note is in a collection
        if note.collection_id:
            collection_share = session.execute(
                select(CollectionShare).where(
                    CollectionShare.collection_id == note.collection_id,
                    CollectionShare.user_id == user.id
                )
            ).scalar_one_or_none()
            
            if collection_share:
                if collection_share.permission == SharePermissionEnum.OWNER:
                    return AccessLevel.OWNER
                elif collection_share.permission == SharePermissionEnum.WRITE:
                    return AccessLevel.WRITE
                elif collection_share.permission == SharePermissionEnum.READ:
                    return AccessLevel.READ
        
        # Check if note is public
        if note.visibility == VisibilityEnum.PUBLIC:
            return AccessLevel.READ
        
        # Check if collection is public
        if note.collection_id:
            collection = session.get(Collection, note.collection_id)
            if collection and collection.visibility == VisibilityEnum.PUBLIC:
                return AccessLevel.READ
        
        return AccessLevel.NONE


def _get_collection_permission_level(user, collection_id: str) -> AccessLevel:
    """Get the actual permission level for a collection."""
    if _is_admin_user(user):
        return AccessLevel.ADMIN
    
    with get_db_session() as session:
        collection = session.get(Collection, collection_id)
        if not collection:
            return AccessLevel.NONE
        
        # Original owner has OWNER level
        if collection.owner_id == user.id:
            return AccessLevel.OWNER
        
        # Check collection share
        collection_share = session.execute(
            select(CollectionShare).where(
                CollectionShare.collection_id == collection_id,
                CollectionShare.user_id == user.id
            )
        ).scalar_one_or_none()
        
        if collection_share:
            if collection_share.permission == SharePermissionEnum.OWNER:
                return AccessLevel.OWNER
            elif collection_share.permission == SharePermissionEnum.WRITE:
                return AccessLevel.WRITE
            elif collection_share.permission == SharePermissionEnum.READ:
                return AccessLevel.READ
        
        # Check if collection is public
        if collection.visibility == VisibilityEnum.PUBLIC:
            return AccessLevel.READ
        
        return AccessLevel.NONE


def collection_permission(user, collection_id: str) -> AccessLevel:
    """Legacy function - use specific functions instead."""
    return _get_collection_permission_level(user, collection_id)


def note_permission(user, note_id: str) -> AccessLevel:
    """Legacy function - use specific functions instead."""
    return _get_note_permission_level(user, note_id)


# New granular permission functions
def is_note_owner(user, note_id: str) -> bool:
    """
    Returns True if the user is the original owner OR has OWNER permission via share.
    Users with OWNER permission are indistinguishable from the original owner.
    """
    level = _get_note_permission_level(user, note_id)
    return level in {AccessLevel.OWNER, AccessLevel.ADMIN}


def is_collection_owner(user, collection_id: str) -> bool:
    """
    Returns True if the user is the original owner OR has OWNER permission via share.
    Users with OWNER permission are indistinguishable from the original owner.
    """
    level = _get_collection_permission_level(user, collection_id)
    return level in {AccessLevel.OWNER, AccessLevel.ADMIN}


def can_write_note(user, note_id: str) -> bool:
    """Returns True if the user can write (create/modify content) on the note."""
    level = _get_note_permission_level(user, note_id)
    return level in {AccessLevel.WRITE, AccessLevel.OWNER, AccessLevel.ADMIN}


def can_write_collection(user, collection_id: str) -> bool:
    """Returns True if the user can write (create/modify content) on the collection."""
    level = _get_collection_permission_level(user, collection_id)
    return level in {AccessLevel.WRITE, AccessLevel.OWNER, AccessLevel.ADMIN}


def can_read_note(user, note_id: str) -> bool:
    """Returns True if the user can read the note."""
    return _get_note_permission_level(user, note_id) != AccessLevel.NONE


def can_read_collection(user, collection_id: str) -> bool:
    """Returns True if the user can read the collection."""
    return _get_collection_permission_level(user, collection_id) != AccessLevel.NONE


def can_read_flashcard(user, note_id: str) -> bool:
    """Flashcards inherit read access from their parent note."""
    return can_read_note(user, note_id)


def can_write_flashcard(user, note_id: str) -> bool:
    """Flashcards inherit write access from their parent note."""
    return can_write_note(user, note_id)


def can_delete_flashcard(user, note_id: str) -> bool:
    """Only OWNER can delete flashcards."""
    return is_note_owner(user, note_id)


def can_read_note_image(user, note_id: str) -> bool:
    """Note images inherit read access from the note."""
    return can_read_note(user, note_id)


def can_read_note_links(user, note_id: str) -> bool:
    """Access to note links requires access to the base note."""
    return can_read_note(user, note_id)


# Placeholder helpers for future inheritance/expansion to shares.
def note_read_ids_for_collections(collection_ids: Iterable[str]) -> Set[str]:
    """Given collection ids, return readable note ids (owner-only baseline)."""
    with get_db_session() as session:
        stmt = select(Note.id).where(Note.collection_id.in_(collection_ids))
        return set(session.scalars(stmt).all())
