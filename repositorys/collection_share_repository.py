from typing import List, Optional

from sqlalchemy import select

from daos.collection_dao import CollectionShare
from utils.db import get_db_session


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
