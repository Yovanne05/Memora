from dataclasses import dataclass
from typing import List, Literal, Optional, Tuple, Set

from sqlalchemy import func, select

from daos.favorite_dao import NoteFavorite
from utils.db import get_db_session


@dataclass
class NoteFavoriteSearchParams:
    note_id: Optional[str] = None
    sort_by: Literal["created_at"] = "created_at"
    sort_dir: Literal["asc", "desc"] = "desc"
    limit: int = 50
    offset: int = 0


def find_many(user_id: str, params: Optional[NoteFavoriteSearchParams] = None) -> Tuple[List[NoteFavorite], int]:
    param = params or NoteFavoriteSearchParams()
    filters = [NoteFavorite.user_id == user_id]
    if param.note_id:
        filters.append(NoteFavorite.note_id == param.note_id)

    stmt = select(NoteFavorite).where(*filters)

    sort_map = {"created_at": NoteFavorite.created_at}
    order_column = sort_map[param.sort_by]
    order_expr = order_column.desc() if param.sort_dir == "desc" else order_column.asc()

    with get_db_session() as session:
        total = session.scalar(select(func.count()).select_from(stmt.subquery()))
        items = session.scalars(
            stmt.order_by(order_expr).limit(param.limit).offset(param.offset)
        ).all()

    return items, total or 0


def find_one(user_id: str, note_id: str) -> Optional[NoteFavorite]:
    stmt = select(NoteFavorite).where(
        NoteFavorite.user_id == user_id,
        NoteFavorite.note_id == note_id,
    )
    with get_db_session() as session:
        return session.execute(stmt).scalar_one_or_none()


def add(favorite: NoteFavorite) -> NoteFavorite:
    with get_db_session() as session:
        session.add(favorite)
        session.flush()
        session.refresh(favorite)
        return favorite


def delete(user_id: str, note_id: str) -> bool:
    with get_db_session() as session:
        favorite = session.get(NoteFavorite, {"user_id": user_id, "note_id": note_id})
        if not favorite:
            return False
        session.delete(favorite)
        session.flush()
        return True


def favorite_note_ids_for_user(user_id: str) -> Set[str]:
    stmt = select(NoteFavorite.note_id).where(NoteFavorite.user_id == user_id)
    with get_db_session() as session:
        return set(session.scalars(stmt).all())
