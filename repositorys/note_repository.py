from dataclasses import dataclass
from typing import Collection, List, Literal, Optional, Tuple

from sqlalchemy import func, select
from sqlalchemy.orm import joinedload

from daos.note_dao import Note
from repositorys.note_repository_filters import (
    build_note_filters,
    build_note_order,
)
from utils.db import get_db_session
from utils.enums import VisibilityEnum


@dataclass
class NoteSearchParams:
    owner_id: Optional[str] = None
    collection_id: Optional[str] = None
    shared_with_user_id: Optional[str] = None
    visibility: VisibilityEnum | None = None
    title_contains: Optional[str] = None
    ids: Optional[list[str]] = None
    tags: Optional[list[str]] = None
    is_favorite: Optional[bool] = False

    sort_by: Literal["title", "created_at", "updated_at"] = "created_at"
    sort_dir: Literal["asc", "desc"] = "desc"

    limit: int = 50
    offset: int = 0


def _scope_to_accessible_ids(
    stmt, accessible_note_ids: Optional[Collection[str]]
):
    if accessible_note_ids is None:
        return stmt
    if not accessible_note_ids:
        return stmt.where(Note.id.is_(None))
    return stmt.where(Note.id.in_(accessible_note_ids))


def list_for_user(
    user,
    params: Optional[NoteSearchParams] = None,
    accessible_note_ids: Optional[Collection[str]] = None,
) -> Tuple[List[Note], int]:
    p = params or NoteSearchParams()
    filter_result = build_note_filters(user, p)
    if filter_result.force_empty:
        return [], 0

    stmt = select(Note).options(
        joinedload(Note.collection), joinedload(Note.owner)
    )

    stmt = stmt.where(*filter_result.filters)
    stmt = _scope_to_accessible_ids(stmt, accessible_note_ids)

    order_expr = build_note_order(p)

    with get_db_session() as session:
        total = session.scalar(
            select(func.count()).select_from(stmt.subquery())
        )
        items = session.scalars(
            stmt.order_by(order_expr).limit(p.limit).offset(p.offset)
        ).all()

    return items, total or 0


def get_for_user(
    user,
    note_id: str,
    accessible_note_ids: Optional[Collection[str]] = None,
) -> Optional[Note]:
    stmt = (
        select(Note)
        .options(joinedload(Note.collection), joinedload(Note.owner))
        .where(Note.id == note_id)
    )
    stmt = _scope_to_accessible_ids(stmt, accessible_note_ids)
    with get_db_session() as session:
        return session.execute(stmt).scalar_one_or_none()


def find_one_unscoped(note_id: str) -> Optional[Note]:
    stmt = (
        select(Note)
        .options(joinedload(Note.collection), joinedload(Note.owner))
        .where(Note.id == note_id)
    )
    with get_db_session() as session:
        return session.execute(stmt).scalar_one_or_none()


def find_one_by_title(
    owner_id: str,
    collection_id: str | None,
    title: str,
) -> Optional[Note]:
    stmt = select(Note).where(
        Note.owner_id == owner_id,
        Note.title == title,
    )
    if collection_id is None:
        stmt = stmt.where(Note.collection_id.is_(None))
    else:
        stmt = stmt.where(Note.collection_id == collection_id)

    with get_db_session() as session:
        return session.execute(stmt).scalar_one_or_none()


def add(note_entity: Note) -> Note:
    with get_db_session() as session:
        session.add(note_entity)
        session.flush()
        session.refresh(note_entity)
        return note_entity


def update(note_entity: Note) -> Note:
    with get_db_session() as session:
        merged: Note = session.merge(note_entity)
        session.flush()
        session.refresh(merged)
        return merged


def update_content(note_id: str, content: str) -> bool:
    with get_db_session() as session:
        entity = session.get(Note, note_id)
        if not entity:
            return False
        entity.content = content
        session.flush()
        return True


def delete(note_id: str) -> bool:
    with get_db_session() as session:
        entity = session.get(Note, note_id)
        if not entity:
            return False
        session.delete(entity)
        session.flush()
        return True
