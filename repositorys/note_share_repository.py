from dataclasses import dataclass
from typing import List, Literal, Optional, Tuple

from sqlalchemy import func, select

from daos.note_dao import NoteShare
from utils.db import get_db_session


@dataclass
class NoteShareSearchParams:
    note_id: Optional[str] = None
    user_id: Optional[str] = None

    sort_by: Literal["created_at"] = "created_at"
    sort_dir: Literal["asc", "desc"] = "desc"

    limit: int = 50
    offset: int = 0


def find_many(params: Optional[NoteShareSearchParams] = None) -> Tuple[List[NoteShare], int]:
    param = params or NoteShareSearchParams()

    filters = []
    if param.note_id:
        filters.append(NoteShare.note_id == param.note_id)
    if param.user_id:
        filters.append(NoteShare.user_id == param.user_id)

    stmt = select(NoteShare).where(*filters)

    sort_map = {
        "created_at": NoteShare.created_at,
    }
    order_column = sort_map[param.sort_by]
    order_expr = order_column.desc() if param.sort_dir == "desc" else order_column.asc()

    with get_db_session() as session:
        total = session.scalar(
            select(func.count()).select_from(stmt.subquery()))
        items = session.scalars(
            stmt.order_by(order_expr).limit(param.limit).offset(param.offset)
        ).all()

    return items, total or 0


def find_by_note(note_id: str) -> List[NoteShare]:
    stmt = select(NoteShare).where(NoteShare.note_id == note_id)
    with get_db_session() as session:
        return session.scalars(stmt).all()


def find_one(note_id: str, user_id: str) -> Optional[NoteShare]:
    stmt = select(NoteShare).where(
        NoteShare.note_id == note_id,
        NoteShare.user_id == user_id,
    )
    with get_db_session() as session:
        return session.execute(stmt).scalar_one_or_none()


def add(share: NoteShare) -> NoteShare:
    with get_db_session() as session:
        session.add(share)
        session.flush()
        session.refresh(share)
        return share


def update(share: NoteShare) -> NoteShare:
    with get_db_session() as session:
        merged: NoteShare = session.merge(share)
        session.flush()
        session.refresh(merged)
        return merged


def delete(note_id: str, user_id: str) -> bool:
    with get_db_session() as session:
        share = session.get(NoteShare, (note_id, user_id))
        if not share:
            return False
        session.delete(share)
        session.flush()
        return True
