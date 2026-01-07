"""
Permission Repository
Data access layer for permission-related queries.
Separates SQL logic from business logic.
"""
from typing import Optional, Set

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from daos.collection_dao import Collection, CollectionShare
from daos.note_dao import Note, NoteShare
from utils.permission_models import PermissionContext
from utils.enums import SharePermissionEnum, VisibilityEnum
from daos.user_dao import User


class PermissionRepository:
    @staticmethod
    def get_note_permission_context(
        session: Session, note_id: str, user_id: str
    ) -> Optional[PermissionContext]:
        note = session.query(Note).filter(Note.id == note_id).first()
        if not note:
            return None

        share = (
            session.query(NoteShare)
            .filter(NoteShare.note_id == note_id, NoteShare.user_id == user_id)
            .first()
        )

        collection_share = None
        if note.collection_id:
            collection_share = (
                session.query(CollectionShare)
                .filter(
                    CollectionShare.collection_id == note.collection_id,
                    CollectionShare.user_id == user_id,
                )
                .first()
            )

        user = session.query(User).filter(User.id == user_id).first()
        if not user:
            return None

        return PermissionContext(
            user_id=user_id,
            user_role=user.role,
            resource_id=note_id,
            resource_type="note",
            owner_id=note.owner_id,
            visibility=note.visibility,
            share_permission=share.permission if share else (
                collection_share.permission if collection_share else None
            ),
            parent_collection_id=note.collection_id,
        )

    @staticmethod
    def get_collection_permission_context(
        session: Session, collection_id: str, user_id: str
    ) -> Optional[PermissionContext]:
        collection = (
            session.query(Collection).filter(Collection.id == collection_id).first()
        )
        if not collection:
            return None

        share = (
            session.query(CollectionShare)
            .filter(
                CollectionShare.collection_id == collection_id,
                CollectionShare.user_id == user_id,
            )
            .first()
        )

        user = session.query(User).filter(User.id == user_id).first()
        if not user:
            return None

        return PermissionContext(
            user_id=user_id,
            user_role=user.role,
            resource_id=collection_id,
            resource_type="collection",
            owner_id=collection.owner_id,
            visibility=collection.visibility,
            share_permission=share.permission if share else None,
        )

    @staticmethod
    def get_accessible_note_ids(session: Session, user_id: str) -> Set[str]:
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
                    Note.owner_id == user_id,
                    Note.visibility == VisibilityEnum.PUBLIC,
                    NoteShare.user_id == user_id,
                    CollectionShare.user_id == user_id,
                    Collection.visibility == VisibilityEnum.PUBLIC,
                    Collection.owner_id == user_id,
                )
            )
        )
        return set(session.scalars(stmt).all())

    @staticmethod
    def get_accessible_collection_ids(session: Session, user_id: str) -> Set[str]:
        stmt = (
            select(Collection.id)
            .outerjoin(
                CollectionShare,
                CollectionShare.collection_id == Collection.id,
            )
            .where(
                or_(
                    Collection.owner_id == user_id,
                    Collection.visibility == VisibilityEnum.PUBLIC,
                    CollectionShare.user_id == user_id,
                )
            )
        )
        return set(session.scalars(stmt).all())

    @staticmethod
    def get_note_ids_in_collections(
        session: Session, collection_ids: Set[str]
    ) -> Set[str]:
        if not collection_ids:
            return set()

        stmt = select(Note.id).where(Note.collection_id.in_(collection_ids))
        return set(session.scalars(stmt).all())


permission_repository = PermissionRepository()
