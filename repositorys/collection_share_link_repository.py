from dataclasses import dataclass
from typing import List, Optional, Tuple

from sqlalchemy import func, select

from daos.collection_share_link_dao import CollectionShareLink
from utils.db import get_db_session


@dataclass
class CollectionShareLinkSearchParams:
    collection_id: Optional[str] = None


def find_many(params: Optional[CollectionShareLinkSearchParams] = None) -> Tuple[List[CollectionShareLink], int]:
    param = params or CollectionShareLinkSearchParams()

    filters = []
    if param.collection_id:
        filters.append(CollectionShareLink.collection_id == param.collection_id)

    stmt = select(CollectionShareLink).where(*filters).order_by(CollectionShareLink.created_at.desc())

    with get_db_session() as session:
        total = session.scalar(
            select(func.count()).select_from(stmt.subquery()))
        items = session.scalars(stmt).all()

    return items, total or 0


def find_by_collection(collection_id: str) -> List[CollectionShareLink]:
    stmt = select(CollectionShareLink).where(CollectionShareLink.collection_id == collection_id)
    with get_db_session() as session:
        return session.scalars(stmt).all()


def find_one(link_id: str) -> Optional[CollectionShareLink]:
    with get_db_session() as session:
        return session.get(CollectionShareLink, link_id)


def add(share_link: CollectionShareLink) -> CollectionShareLink:
    with get_db_session() as session:
        session.add(share_link)
        session.flush()
        session.refresh(share_link)
        return share_link


def delete(link_id: str) -> bool:
    with get_db_session() as session:
        share_link = session.get(CollectionShareLink, link_id)
        if not share_link:
            return False
        session.delete(share_link)
        session.flush()
        return True
