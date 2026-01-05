from dataclasses import dataclass
from typing import List, Literal, Optional, Tuple

from sqlalchemy import func, select

from daos.note_share_link_dao import NoteShareLink
from utils.db import get_db_session


@dataclass
class NoteShareLinkSearchParams:
    note_id: Optional[str] = None

    sort_by: Literal["created_at"] = "created_at"
    sort_dir: Literal["asc", "desc"] = "desc"

    limit: int = 50
    offset: int = 0


def find_many(params: Optional[NoteShareLinkSearchParams] = None) -> Tuple[List[NoteShareLink], int]:
    param = params or NoteShareLinkSearchParams()

    filters = []
    if param.note_id:
        filters.append(NoteShareLink.note_id == param.note_id)

    stmt = select(NoteShareLink).where(*filters)

    sort_map = {
        "created_at": NoteShareLink.created_at,
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


def find_by_note(note_id: str) -> List[NoteShareLink]:
    stmt = select(NoteShareLink).where(NoteShareLink.note_id == note_id)
    with get_db_session() as session:
        return session.scalars(stmt).all()


def find_one(link_id: str) -> Optional[NoteShareLink]:
    with get_db_session() as session:
        return session.get(NoteShareLink, link_id)


def add(share_link: NoteShareLink) -> NoteShareLink:
    with get_db_session() as session:
        session.add(share_link)
        session.flush()
        session.refresh(share_link)
        return share_link


def delete(link_id: str) -> bool:
    with get_db_session() as session:
        share_link = session.get(NoteShareLink, link_id)
        if not share_link:
            return False
        session.delete(share_link)
        session.flush()
        return True
