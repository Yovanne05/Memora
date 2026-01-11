from datetime import datetime, timedelta
from sqlalchemy import func, select

from daos.note_dao import Note, NoteShare
from daos.collection_dao import Collection, CollectionShare
from daos.flashcard_dao import Flashcard
from daos.review_dao import Review
from dtos.user_statistics_dto import TimeSeriesPointDTO
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


def get_notes_created_timeseries(user_id: str, days: int) -> list[TimeSeriesPointDTO]:
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)

    with get_db_session() as session:
        stmt = (
            select(
                func.date(Note.created_at).label("date"),
                func.count(Note.id).label("value"),
            )
            .where(
                Note.owner_id == user_id,
                Note.created_at >= start_date,
                Note.created_at <= end_date,
            )
            .group_by(func.date(Note.created_at))
            .order_by(func.date(Note.created_at))
        )

        results = session.execute(stmt).all()
        return [
            TimeSeriesPointDTO(
                date=str(row.date),
                value=row.value
            )
            for row in results
        ]


def get_collections_created_timeseries(
    user_id: str, days: int
) -> list[TimeSeriesPointDTO]:
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)

    with get_db_session() as session:
        stmt = (
            select(
                func.date(Collection.created_at).label("date"),
                func.count(Collection.id).label("value"),
            )
            .where(
                Collection.owner_id == user_id,
                Collection.created_at >= start_date,
                Collection.created_at <= end_date,
            )
            .group_by(func.date(Collection.created_at))
            .order_by(func.date(Collection.created_at))
        )

        results = session.execute(stmt).all()
        return [
            TimeSeriesPointDTO(
                date=str(row.date),
                value=row.value
            )
            for row in results
        ]


def get_reviews_timeseries(user_id: str, days: int) -> list[TimeSeriesPointDTO]:
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)

    with get_db_session() as session:
        stmt = (
            select(
                func.date(Review.reviewed_at).label("date"),
                func.count().label("value"),
            )
            .where(
                Review.user_id == user_id,
                Review.reviewed_at >= start_date,
                Review.reviewed_at <= end_date,
            )
            .group_by(func.date(Review.reviewed_at))
            .order_by(func.date(Review.reviewed_at))
        )

        results = session.execute(stmt).all()
        return [
            TimeSeriesPointDTO(
                date=str(row.date),
                value=row.value
            )
            for row in results
        ]
