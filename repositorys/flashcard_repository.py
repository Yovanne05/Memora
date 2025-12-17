from dataclasses import dataclass
from typing import List, Literal, Optional, Tuple

from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from daos.flashcard_dao import Flashcard
from utils.access_scope import accessible_note_ids
from utils.db import get_db_session


@dataclass
class FlashcardSearchParams:
    note_id: Optional[str] = None
    question_contains: Optional[str] = None

    sort_by: Literal["question", "created_at", "updated_at"] = "created_at"
    sort_dir: Literal["asc", "desc"] = "desc"

    limit: int = 50
    offset: int = 0


def _scope_to_user(stmt, user):
    allowed_note_ids = accessible_note_ids(user)
    if allowed_note_ids is None:
        return stmt
    if not allowed_note_ids:
        return stmt.where(Flashcard.note_id.is_(None))
    return stmt.where(Flashcard.note_id.in_(allowed_note_ids))


def list_for_user(user, params: Optional[FlashcardSearchParams] = None) -> Tuple[List[Flashcard], int]:
    param = params or FlashcardSearchParams()

    filters = []
    if param.note_id:
        filters.append(Flashcard.note_id == param.note_id)

    if param.question_contains:
        filters.append(Flashcard.question.ilike(
            f"%{param.question_contains}%"))

    stmt = select(Flashcard).where(
        *filters).options(selectinload(Flashcard.answers))

    stmt = _scope_to_user(stmt, user)

    sort_map = {
        "question": Flashcard.question,
        "created_at": Flashcard.created_at,
        "updated_at": Flashcard.updated_at,
    }
    order_column = sort_map[param.sort_by]
    order_expr = order_column.desc() if param.sort_dir == "desc" else order_column.asc()

    with get_db_session() as session:
        total = session.scalar(
            select(func.count()).select_from(stmt.subquery()))
        items = session.scalars(
            stmt.order_by(order_expr).limit(param.limit).offset(param.offset)
        ).all()

    return items, total or 0


def get_for_user(user, flashcard_id: str) -> Optional[Flashcard]:
    stmt = select(Flashcard).where(Flashcard.id == flashcard_id).options(
        selectinload(Flashcard.answers)
    )
    stmt = _scope_to_user(stmt, user)
    with get_db_session() as session:
        return session.execute(stmt).scalar_one_or_none()


def find_one_unscoped(flashcard_id: str) -> Optional[Flashcard]:
    stmt = select(Flashcard).where(Flashcard.id == flashcard_id).options(
        selectinload(Flashcard.answers)
    )
    with get_db_session() as session:
        return session.execute(stmt).scalar_one_or_none()


def find_many(params: Optional[FlashcardSearchParams] = None) -> Tuple[List[Flashcard], int]:
    raise NotImplementedError("Use list_for_user with an authenticated user context.")


def find_by_note(note_id: str) -> List[Flashcard]:
    stmt = (
        select(Flashcard)
        .where(Flashcard.note_id == note_id)
        .options(selectinload(Flashcard.answers))
    )
    with get_db_session() as session:
        return list(session.scalars(stmt).all())


def find_one(flashcard_id: str) -> Optional[Flashcard]:
    raise NotImplementedError("Use get_for_user or find_one_unscoped explicitly.")


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
