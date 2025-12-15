from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from daos.flashcard_dao import Flashcard
from utils.db import get_db_session


def find_by_note(note_id: str) -> List[Flashcard]:
    stmt = (
        select(Flashcard)
        .where(Flashcard.note_id == note_id)
        .options(selectinload(Flashcard.answers))
    )
    with get_db_session() as session:
        return list(session.scalars(stmt).all())


def find_one(flashcard_id: str) -> Optional[Flashcard]:
    stmt = select(Flashcard).where(Flashcard.id == flashcard_id).options(
        selectinload(Flashcard.answers)
    )
    with get_db_session() as session:
        return session.execute(stmt).scalar_one_or_none()


def add(flashcard: Flashcard) -> Flashcard:
    with get_db_session() as session:
        session.add(flashcard)
        session.flush()
        stmt = (
            select(Flashcard)
            .where(Flashcard.id == flashcard.id)
            .options(selectinload(Flashcard.answers))
        )
        return session.execute(stmt).scalar_one()


def update(flashcard: Flashcard) -> Flashcard:
    with get_db_session() as session:
        merged = session.merge(flashcard)
        session.flush()
        stmt = (
            select(Flashcard)
            .where(Flashcard.id == merged.id)
            .options(selectinload(Flashcard.answers))
        )
        return session.execute(stmt).scalar_one()


def delete(flashcard_id: str) -> bool:
    with get_db_session() as session:
        entity = session.get(Flashcard, flashcard_id)
        if not entity:
            return False
        session.delete(entity)
        session.flush()
        return True
