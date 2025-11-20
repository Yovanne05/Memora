from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional
from typing_extensions import Literal

from sqlalchemy import Tuple, func, select

from daos.collection_dao import Collection
from utils.db import get_db_session
from utils.enums import VisibilityEnum

@dataclass
class CollectionSearchParams :

    owner_id : Optional[str] = None
    visibility : VisibilityEnum | None = None
    title_contains : Optional[str] = None
    ids : Optional[list[str]] = None

    sort_by : Literal["title", "created_at", "updated_at"] = "created_at"
    sort_dir : Literal["asc", "desc"] = "desc"

    limit : int = 50
    offset : int = 0
    
def find_one(collection_id: str) -> Optional[Collection]:
    with get_db_session() as session:
        return session.get(Collection, collection_id)


def find_for_owner(collection_id: str, owner_id: str) -> Optional[Collection]:
    stmt = select(Collection).where(
        Collection.id == collection_id, Collection.owner_id == owner_id
    )
    with get_db_session() as session:
        return session.execute(stmt).scalar_one_or_none()


def add(collection_entity : Collection) -> Collection :
    with get_db_session() as session :
        session.add(collection_entity)
        session.flush()
        session.refresh(collection_entity)

        return collection_entity


def update(collection_entity : Collection) -> Collection :
    with get_db_session() as session :
        merged : Collection = session.merge(collection_entity)
        session.flush()
        session.refresh(merged)

        return merged


def delete(collection_id : str) -> bool :
    with get_db_session() as session :
        entity = session.get(Collection, collection_id)
        if not entity :
            return False
        
        session.delete(entity)
        session.flush()

        return True


def find_many(params : Optional[CollectionSearchParams] = None) -> Tuple[List[Collection], int] :
    param = params or CollectionSearchParams()
    filters = []
    if param.owner_id :
        filters.append(Collection.owner_id == param.owner_id)

    if param.visibility :
        filters.append(Collection.visibility == param.visibility)

    if param.title_contains:
        filters.append(Collection.name.ilike(f"%{param.title_contains}%"))


    if param.ids :
        filters.append(Collection.id.in_(param.ids))

    request = select(Collection).where(*filters)
    sort_map = {
        "title": Collection.name,
        "created_at": Collection.created_at,
        "updated_at": Collection.updated_at,
    }
    order_column = sort_map[param.sort_by]
    order_expr = order_column.desc() if param.sort_dir == "desc" else order_column.asc()

    with get_db_session() as session :
        total = session.scalar(select(func.count()).select_from(request.subquery()))
        items = session.scalars(request.order_by(order_expr).limit(param.limit).offset(param.offset)).all()


    return items, total or 0