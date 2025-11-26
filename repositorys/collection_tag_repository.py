from typing import List

from sqlalchemy import delete, select

from daos.collection_dao import CollectionTag
from daos.tag_dao import Tag
from utils.db import get_db_session


def list_tags(collection_id: str) -> List[Tag]:
    stmt = select(Tag).join(
        CollectionTag, CollectionTag.tag_id == Tag.id
    ).where(CollectionTag.collection_id == collection_id)
    with get_db_session() as session:
        return session.scalars(stmt).all()


def replace_tags(collection_id: str, tag_ids: list[str]) -> List[Tag]:
    unique_ids = list(dict.fromkeys(tag_ids))
    with get_db_session() as session:
        session.execute(
            delete(CollectionTag).where(
                CollectionTag.collection_id == collection_id,
            )
        )
        for tag_id in unique_ids:
            session.add(CollectionTag(collection_id=collection_id, tag_id=tag_id))
        session.flush()
        if not unique_ids:
            return []
        tags = session.scalars(
            select(Tag).where(Tag.id.in_(unique_ids))
        ).all()
        return tags
