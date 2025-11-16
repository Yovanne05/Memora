from __future__ import annotations

from typing import Optional

from sqlalchemy import select

from daos.collection_dao import Collection
from utils.db import get_db_session


def find_one(collection_id: str) -> Optional[Collection]:
    with get_db_session() as session:
        return session.get(Collection, collection_id)


def find_for_owner(collection_id: str, owner_id: str) -> Optional[Collection]:
    stmt = select(Collection).where(
        Collection.id == collection_id, Collection.owner_id == owner_id
    )
    with get_db_session() as session:
        return session.execute(stmt).scalar_one_or_none()
