from dataclasses import dataclass
from typing import List, Literal, Optional, Tuple

from sqlalchemy import func, select

from daos.tag_dao import Tag
from utils.db import get_db_session


@dataclass
class TagSearchParams:
    name: Optional[str] = None
    name_contains: Optional[str] = None
    ids: Optional[list[str]] = None

    sort_by: Literal["name", "created_at", "id"] = "created_at"
    sort_dir: Literal["asc", "desc"] = "desc"

    limit: int = 50
    offset: int = 0


def find_many(params: Optional[TagSearchParams] = None) -> Tuple[List[Tag], int]:
    p = params or TagSearchParams()
    filters = []

    if p.name:
        filters.append(Tag.name == p.name)

    if p.name_contains:
        filters.append(Tag.name.ilike(f"%{p.name_contains}%"))

    if p.ids:
        filters.append(Tag.id.in_(p.ids))

    stmt = select(Tag).where(*filters)

    sort_map = {
        "name": Tag.name,
        "created_at": Tag.created_at,
        "id": Tag.id,
    }
    order_column = sort_map[p.sort_by]
    order_expr = order_column.desc() if p.sort_dir == "desc" else order_column.asc()

    with get_db_session() as session:
        total = session.scalar(select(func.count()).select_from(stmt.subquery()))
        items = session.scalars(
            stmt.order_by(order_expr).limit(p.limit).offset(p.offset)
        ).all()

    return items, total or 0


def find_one(tag_id: str) -> Optional[Tag]:
    with get_db_session() as session:
        return session.get(Tag, tag_id)


def find_one_by_name(name: str) -> Optional[Tag]:
    stmt = select(Tag).where(Tag.name == name)
    with get_db_session() as session:
        return session.execute(stmt).scalar_one_or_none()


def add(tag_entity: Tag) -> Tag:
    with get_db_session() as session:
        session.add(tag_entity)
        session.flush()
        session.refresh(tag_entity)
        return tag_entity


def update(tag_entity: Tag) -> Tag:
    with get_db_session() as session:
        merged: Tag = session.merge(tag_entity)
        session.flush()
        session.refresh(merged)
        return merged


def delete(tag_id: str) -> bool:
    with get_db_session() as session:
        entity = session.get(Tag, tag_id)
        if not entity:
            return False
        session.delete(entity)
        session.flush()
        return True
