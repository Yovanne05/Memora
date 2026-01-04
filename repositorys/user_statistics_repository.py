from sqlalchemy import func, select

from daos.note_dao import Note, NoteShare
from daos.collection_dao import Collection, CollectionShare
from daos.flashcard_dao import Flashcard
from utils.db import get_db_session


def get_notes_created_count(user_id: str) -> int:
    stmt = select(func.count(Note.id)).where(Note.owner_id == user_id)
    with get_db_session() as session:
        return session.scalar(stmt) or 0


def get_collections_created_count(user_id: str) -> int:
    stmt = select(func.count(Collection.id)).where(Collection.owner_id == user_id)
    with get_db_session() as session:
        return session.scalar(stmt) or 0


def get_flashcards_created_count(user_id: str) -> int:
    notes_subquery = select(Note.id).where(Note.owner_id == user_id).subquery()
    stmt = select(func.count(Flashcard.id)).where(
        Flashcard.note_id.in_(select(notes_subquery))
    )
    with get_db_session() as session:
        return session.scalar(stmt) or 0


def get_notes_shared_by_user_count(user_id: str) -> int:
    notes_subquery = select(Note.id).where(Note.owner_id == user_id).subquery()
    stmt = select(func.count(func.distinct(NoteShare.note_id))).where(
        NoteShare.note_id.in_(select(notes_subquery))
    )
    with get_db_session() as session:
        return session.scalar(stmt) or 0


def get_collections_shared_by_user_count(user_id: str) -> int:
    collections_subquery = (
        select(Collection.id).where(Collection.owner_id == user_id).subquery()
    )
    stmt = select(func.count(func.distinct(CollectionShare.collection_id))).where(
        CollectionShare.collection_id.in_(select(collections_subquery))
    )
    with get_db_session() as session:
        return session.scalar(stmt) or 0
