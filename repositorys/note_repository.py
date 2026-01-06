from dataclasses import dataclass
from typing import List, Literal, Optional, Tuple
from sqlalchemy import func, select
from sqlalchemy.orm import joinedload
from daos.note_dao import Note
from domain_services.permission_domain_service import permission_domain_service
from repositorys.note_favorite_repository import favorite_note_ids_for_user
from utils.db import get_db_session
from utils.enums import VisibilityEnum


@dataclass
class NoteSearchParams:
    owner_id: Optional[str] = None
    collection_id: Optional[str] = None
    shared_with_user_id: Optional[str] = None
    visibility: VisibilityEnum | None = None
    title_contains: Optional[str] = None
    content_contains: Optional[str] = None
    ids: Optional[list[str]] = None
    tags: Optional[list[str]] = None
    is_favorite: Optional[bool] = False

    sort_by: Literal["title", "created_at", "updated_at"] = "created_at"
    sort_dir: Literal["asc", "desc"] = "desc"

    limit: int = 50
    offset: int = 0


def _scope_to_user(stmt, user):
    accessible_ids = permission_domain_service.get_accessible_note_ids(
        user.id, user.role
    )
    if accessible_ids is None:
        return stmt
    if not accessible_ids:
        return stmt.where(Note.id.is_(None))
    return stmt.where(Note.id.in_(accessible_ids))


def list_for_user(user, params: Optional[NoteSearchParams] = None) -> Tuple[List[Note], int]:
    p = params or NoteSearchParams()
    filters = []
    favorite_ids: set[str] | None = None

    if p.collection_id:
        filters.append(Note.collection_id == p.collection_id)

    if p.visibility:
        filters.append(Note.visibility == p.visibility)

    if p.title_contains:
        filters.append(Note.title.ilike(f"%{p.title_contains}%"))

    if p.content_contains:
        filters.append(Note.content.ilike(f"%{p.content_contains}%"))

    if p.ids:
        filters.append(Note.id.in_(p.ids))

    if p.tags:
        for tag in p.tags:
            filters.append(Note.tags.contains([tag]))

    if p.is_favorite:
        favorite_ids = favorite_note_ids_for_user(user.id)
        if not favorite_ids:
            return [], 0
        filters.append(Note.id.in_(favorite_ids))

    stmt = select(Note).options(
        joinedload(Note.collection), joinedload(Note.owner)
    )

    stmt = stmt.where(*filters)
    stmt = _scope_to_user(stmt, user)

    sort_map = {
        "title": Note.title,
        "created_at": Note.created_at,
        "updated_at": Note.updated_at,
    }
    order_column = sort_map[p.sort_by]
    order_expr = order_column.desc() if p.sort_dir == "desc" else order_column.asc()

    with get_db_session() as session:
        total = session.scalar(
            select(func.count()).select_from(stmt.subquery())
        )
        items = session.scalars(
            stmt.order_by(order_expr).limit(p.limit).offset(p.offset)
        ).all()

    return items, total or 0


def get_for_user(user, note_id: str) -> Optional[Note]:
    stmt = (
        select(Note)
        .options(joinedload(Note.collection), joinedload(Note.owner))
        .where(Note.id == note_id)
    )
    stmt = _scope_to_user(stmt, user)
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


def delete(note_id: str) -> bool:
    with get_db_session() as session:
        entity = session.get(Note, note_id)
        if not entity:
            return False
        session.delete(entity)
        session.flush()
        return True
