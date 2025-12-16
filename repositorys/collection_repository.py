from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional, Tuple
from typing_extensions import Literal

from sqlalchemy import func, select, Select
from sqlalchemy.orm import selectinload, Session

from daos.collection_dao import Collection
from daos.note_dao import Note
from utils.access_scope import accessible_collection_ids
from utils.db import get_db_session
from utils.enums import VisibilityEnum


def _apply_eager_loading(stmt: Select) -> Select:
    return stmt.options(
        selectinload(Collection.notes).selectinload(Note.owner),
        selectinload(Collection.notes).selectinload(Note.outgoing_links),
        selectinload(Collection.notes).selectinload(Note.incoming_links)
    )


def _reload_with_relationships(session: Session, collection_id: str) -> Collection:
    stmt = select(Collection).where(Collection.id == collection_id)
    stmt = _apply_eager_loading(stmt)
    return session.execute(stmt).scalar_one()


def _scope_to_user(stmt: Select, user) -> Select:
    accessible_ids = accessible_collection_ids(user)
    if accessible_ids is None:
        return stmt
    if not accessible_ids:
        return stmt.where(Collection.id.is_(None))
    return stmt.where(Collection.id.in_(accessible_ids))

@dataclass
class CollectionSearchParams :

    owner_id : Optional[str] = None
    visibility : VisibilityEnum | None = None
    title_contains : Optional[str] = None
    ids : Optional[list[str]] = None
    tags: Optional[list[str]] = None
    shared_with_user_id: Optional[str] = None

    only_with_notes: bool = False

    sort_by : Literal["title", "created_at", "updated_at"] = "created_at"
    sort_dir : Literal["asc", "desc"] = "desc"

    limit : int = 50
    offset : int = 0
    
def get_for_user(user, collection_id: str) -> Optional[Collection]:
    with get_db_session() as session:
        stmt = select(Collection).where(Collection.id == collection_id)
        stmt = _scope_to_user(stmt, user)
        stmt = _apply_eager_loading(stmt)
        return session.execute(stmt).scalar_one_or_none()


def find_one_unscoped(collection_id: str) -> Optional[Collection]:
    """Temporary helper for non-read flows. Avoid using for GET responses."""
    with get_db_session() as session:
        stmt = select(Collection).where(Collection.id == collection_id)
        stmt = _apply_eager_loading(stmt)
        return session.execute(stmt).scalar_one_or_none()


def find_for_owner(collection_id: str, owner_id: str) -> Optional[Collection]:
    with get_db_session() as session:
        stmt = select(Collection).where(
            Collection.id == collection_id, Collection.owner_id == owner_id
        )
        stmt = _apply_eager_loading(stmt)
        return session.execute(stmt).scalar_one_or_none()


def add(collection_entity: Collection) -> Collection:
    with get_db_session() as session:
        session.add(collection_entity)
        session.flush()
        return _reload_with_relationships(session, collection_entity.id)


def update(collection_entity: Collection) -> Collection:
    with get_db_session() as session:
        merged = session.merge(collection_entity)
        session.flush()
        return _reload_with_relationships(session, merged.id)


def delete(collection_id: str) -> bool:
    with get_db_session() as session:
        entity = session.get(Collection, collection_id)
        if not entity:
            return False

        session.delete(entity)
        session.flush()
        return True


def list_for_user(user, params: Optional[CollectionSearchParams] = None) -> Tuple[List[Collection], int]:
    param = params or CollectionSearchParams()

    filters = []

    if param.visibility:
        filters.append(Collection.visibility == param.visibility)

    if param.title_contains:
        filters.append(Collection.name.ilike(f"%{param.title_contains}%"))

    if param.ids:
        filters.append(Collection.id.in_(param.ids))

    if param.tags:
        for tag in param.tags:
            filters.append(Collection.tags.contains([tag]))

    stmt = select(Collection)

    if param.only_with_notes:
        note_exists = (
            select(1)
            .where(Note.collection_id == Collection.id)
            .exists()
        )
        filters.append(note_exists)

    stmt = stmt.where(*filters)
    stmt = _scope_to_user(stmt, user)

    sort_map = {
        "title": Collection.name,
        "created_at": Collection.created_at,
        "updated_at": Collection.updated_at,
    }
    order_column = sort_map[param.sort_by]
    order_expr = order_column.desc() if param.sort_dir == "desc" else order_column.asc()

    stmt = _apply_eager_loading(stmt)

    with get_db_session() as session:
        total = session.scalar(select(func.count()).select_from(stmt.subquery()))
        items = session.scalars(
            stmt.order_by(order_expr).limit(param.limit).offset(param.offset)
        ).all()

    return items, total or 0
