from dataclasses import dataclass
from typing import List, Literal, Optional, Tuple

from sqlalchemy import func, or_, select

from daos.note_dao import NoteLink
from utils.db import get_db_session


@dataclass
class NoteLinkSearchParams:
    note_id: Optional[str] = None
    search: Optional[str] = None

    sort_by: Literal["created_at"] = "created_at"
    sort_dir: Literal["asc", "desc"] = "desc"

    limit: int = 50
    offset: int = 0


def _normalize_ids(note_id_1: str, note_id_2: str) -> Tuple[str, str]:
    return tuple(sorted((note_id_1, note_id_2)))


def find_many(
    params: Optional[NoteLinkSearchParams] = None,
) -> Tuple[List[NoteLink], int]:
    param = params or NoteLinkSearchParams()

    filters = []

    if param.note_id:
        filters.append(
            or_(
                NoteLink.note_id_1 == param.note_id,
                NoteLink.note_id_2 == param.note_id,
            )
        )

    if param.search:
        like_expr = f"%{param.search}%"
        filters.append(NoteLink.label.ilike(like_expr))

    stmt = select(NoteLink).where(*filters)

    sort_map = {
        "created_at": NoteLink.created_at,
    }
    order_column = sort_map[param.sort_by]
    order_expr = order_column.desc() if param.sort_dir == "desc" else order_column.asc()

    with get_db_session() as session:
        total = session.scalar(select(func.count()).select_from(stmt.subquery()))
        items = (
            session.scalars(stmt.order_by(order_expr).limit(param.limit).offset(param.offset))
            .all()
        )

    return items, total or 0


def find_by_note(note_id: str) -> List[NoteLink]:
    stmt = select(NoteLink).where(
        or_(NoteLink.note_id_1 == note_id, NoteLink.note_id_2 == note_id)
    )
    with get_db_session() as session:
        return session.scalars(stmt).all()


def find_one(note_id_1: str, note_id_2: str) -> Optional[NoteLink]:
    normalized_id_1, normalized_id_2 = _normalize_ids(note_id_1, note_id_2)
    stmt = select(NoteLink).where(
        NoteLink.note_id_1 == normalized_id_1,
        NoteLink.note_id_2 == normalized_id_2,
    )
    with get_db_session() as session:
        return session.execute(stmt).scalar_one_or_none()


def add(link: NoteLink) -> NoteLink:
    normalized_id_1, normalized_id_2 = _normalize_ids(link.note_id_1, link.note_id_2)
    link.note_id_1, link.note_id_2 = normalized_id_1, normalized_id_2

    with get_db_session() as session:
        session.add(link)
        session.flush()
        session.refresh(link)
        return link


def delete(note_id_1: str, note_id_2: str) -> bool:
    normalized_id_1, normalized_id_2 = _normalize_ids(note_id_1, note_id_2)
    stmt = select(NoteLink).where(
        NoteLink.note_id_1 == normalized_id_1,
        NoteLink.note_id_2 == normalized_id_2,
    )
    with get_db_session() as session:
        entity = session.execute(stmt).scalar_one_or_none()
        if not entity:
            return False
        session.delete(entity)
        session.flush()
        return True


def update_label(note_id_1: str, note_id_2: str, new_label: str) -> Optional[NoteLink]:
    normalized_id_1, normalized_id_2 = _normalize_ids(note_id_1, note_id_2)
    stmt = select(NoteLink).where(
        NoteLink.note_id_1 == normalized_id_1,
        NoteLink.note_id_2 == normalized_id_2,
    )

    with get_db_session() as session:
        entity = session.execute(stmt).scalar_one_or_none()
        if entity is None:
            return None

        entity.label = new_label
        session.flush()
        session.refresh(entity)
        return entity
