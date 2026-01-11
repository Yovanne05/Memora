from dataclasses import dataclass
from typing import List, Literal, Optional, Tuple

from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from daos.flashcard_dao import Flashcard
from domain_services.permission_domain_service import permission_domain_service
from utils.db import get_db_session


@dataclass
class FlashcardSearchParams:
    note_id: Optional[str] = None
    question_contains: Optional[str] = None

    sort_by: Literal["question", "created_at", "updated_at"] = "created_at"
    sort_dir: Literal["asc", "desc"] = "desc"

    limit: int = 50
    offset: int = 0


def _select_with_answers():
    return select(Flashcard).options(selectinload(Flashcard.answers))


def _select_by_id(flashcard_id: str):
    return _select_with_answers().where(Flashcard.id == flashcard_id)


def _scope_to_user(stmt, user):
    allowed_note_ids = permission_domain_service.get_accessible_note_ids(
        user.id, user.role
    )
    if allowed_note_ids is None:
        return stmt
    if not allowed_note_ids:
        return stmt.where(Flashcard.note_id.is_(None))
    return stmt.where(Flashcard.note_id.in_(allowed_note_ids))


def list_for_user(
    user, params: Optional[FlashcardSearchParams] = None
) -> Tuple[List[Flashcard], int]:
    param = params or FlashcardSearchParams()

    filters = []
    if param.note_id:
        filters.append(Flashcard.note_id == param.note_id)

    if param.question_contains:
        filters.append(
            Flashcard.question.ilike(f"%{param.question_contains}%")
        )

    stmt = _select_with_answers().where(*filters)

    stmt = _scope_to_user(stmt, user)

    sort_map = {
        "question": Flashcard.question,
        "created_at": Flashcard.created_at,
        "updated_at": Flashcard.updated_at,
    }
    order_column = sort_map[param.sort_by]
    order_expr = (
        order_column.desc() if param.sort_dir == "desc" else order_column.asc()
    )

    with get_db_session() as session:
        total = session.scalar(
            select(func.count()).select_from(stmt.subquery())
        )
        items = session.scalars(
            stmt.order_by(order_expr).limit(param.limit).offset(param.offset)
        ).all()

    return items, total or 0


def get_for_user(user, flashcard_id: str) -> Optional[Flashcard]:
    stmt = _select_by_id(flashcard_id)
    stmt = _scope_to_user(stmt, user)
    with get_db_session() as session:
        return session.execute(stmt).scalar_one_or_none()


def find_one_unscoped(flashcard_id: str) -> Optional[Flashcard]:
    stmt = _select_by_id(flashcard_id)
    with get_db_session() as session:
        return session.execute(stmt).scalar_one_or_none()


def find_by_note(note_id: str) -> List[Flashcard]:
    stmt = _select_with_answers().where(Flashcard.note_id == note_id)
    with get_db_session() as session:
        return list(session.scalars(stmt).all())


def add(flashcard: Flashcard) -> Flashcard:
    with get_db_session() as session:
        session.add(flashcard)
        session.flush()
        stmt = _select_by_id(flashcard.id)
        return session.execute(stmt).scalar_one()


def update(flashcard: Flashcard) -> Flashcard:
    with get_db_session() as session:
        merged = session.merge(flashcard)
        session.flush()
        stmt = _select_by_id(merged.id)
        return session.execute(stmt).scalar_one()


def delete(flashcard_id: str) -> bool:
    with get_db_session() as session:
        entity = session.get(Flashcard, flashcard_id)
        if not entity:
            return False
        session.delete(entity)
        session.flush()
        return True
