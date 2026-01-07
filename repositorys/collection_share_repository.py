from dataclasses import dataclass
from typing import List, Literal, Optional, Tuple

from sqlalchemy import func, select

from daos.collection_dao import CollectionShare
from utils.db import get_db_session


@dataclass
class CollectionShareSearchParams:
    collection_id: Optional[str] = None
    user_id: Optional[str] = None

    sort_by: Literal["created_at"] = "created_at"
    sort_dir: Literal["asc", "desc"] = "desc"

    limit: int = 50
    offset: int = 0



def find_many(
    params: Optional[CollectionShareSearchParams] = None,
) -> Tuple[List[CollectionShare], int]:
    param = params or CollectionShareSearchParams()

    filters = []
    if param.collection_id:
        filters.append(CollectionShare.collection_id == param.collection_id)
    if param.user_id:
        filters.append(CollectionShare.user_id == param.user_id)

    stmt = select(CollectionShare).where(*filters)

    sort_map = {
        "created_at": CollectionShare.created_at,
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


def find_by_collection(collection_id: str) -> List[CollectionShare]:
    stmt = select(CollectionShare).where(
        CollectionShare.collection_id == collection_id
    )
    with get_db_session() as session:
        return session.scalars(stmt).all()


def find_one(
    collection_id: str, user_id: str
) -> Optional[CollectionShare]:
    stmt = select(CollectionShare).where(
        CollectionShare.collection_id == collection_id,
        CollectionShare.user_id == user_id,
    )
    with get_db_session() as session:
        return session.execute(stmt).scalar_one_or_none()


def add(share: CollectionShare) -> CollectionShare:
    with get_db_session() as session:
        session.add(share)
        session.flush()
        session.refresh(share)
        return share


def update(share: CollectionShare) -> CollectionShare:
    with get_db_session() as session:
        merged: CollectionShare = session.merge(share)
        session.flush()
        session.refresh(merged)
        return merged


def delete(collection_id: str, user_id: str) -> bool:
    with get_db_session() as session:
        share = session.get(CollectionShare, (collection_id, user_id))
        if not share:
            return False
        session.delete(share)
        session.flush()
        return True
