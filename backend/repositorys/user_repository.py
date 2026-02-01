from dataclasses import dataclass
from typing import List, Literal, Optional, Tuple

from sqlalchemy import func, or_, select

from daos.user_dao import User
from utils.db import get_db_session
from utils.enums import RoleEnum


@dataclass
class UserSearchParams:
    email: Optional[str] = None
    username: Optional[str] = None
    username_contains: Optional[str] = None
    role: Optional[RoleEnum] = None
    ids: Optional[list[str]] = None

    sort_by: Literal["email", "username", "created_at", "id"] = "created_at"
    sort_dir: Literal["asc", "desc"] = "desc"

    limit: int = 50
    offset: int = 0


def find_many(params: Optional[UserSearchParams] = None) -> Tuple[List[User], int]:
    p = params or UserSearchParams()
    filters = []

    if p.email:
        filters.append(User.email == p.email)

    if p.username:
        filters.append(User.username == p.username)

    if p.username_contains:
        filters.append(User.username.ilike(f"%{p.username_contains}%"))

    if p.ids:
        filters.append(User.id.in_(p.ids))

    if p.role:
        filters.append(User.role == p.role)

    stmt = select(User).where(*filters)

    order_map = {
        "email": User.email,
        "username": User.username,
        "created_at": User.created_at,
        "id": User.id,
    }
    order_column = order_map[p.sort_by]
    order_expr = order_column.desc() if p.sort_dir == "desc" else order_column.asc()

    with get_db_session() as session:
        total = session.scalar(
            select(func.count()).select_from(stmt.subquery())
        )
        items = session.scalars(
            stmt.order_by(order_expr).limit(p.limit).offset(p.offset)
        ).all()

    return items, total or 0


def find_one(user_id: str) -> Optional[User]:
    with get_db_session() as session:
        return session.get(User, user_id)


def find_one_by_email(email: str) -> Optional[User]:
    stmt = select(User).where(User.email == email)
    with get_db_session() as session:
        return session.execute(stmt).scalar_one_or_none()


def find_one_by_username(username: str) -> Optional[User]:
    stmt = select(User).where(User.username == username)
    with get_db_session() as session:
        return session.execute(stmt).scalar_one_or_none()


def find_one_by_identifier(identifier: str) -> Optional[User]:
    stmt = select(User).where(
        or_(User.email == identifier, User.username == identifier)
    )
    with get_db_session() as session:
        return session.execute(stmt).scalar_one_or_none()


def add(user_entity: User) -> User:
    with get_db_session() as session:
        session.add(user_entity)
        session.flush()
        session.refresh(user_entity)
        return user_entity


def update(user_entity: User) -> User:
    with get_db_session() as session:
        merged: User = session.merge(user_entity)
        session.flush()
        session.refresh(merged)
        return merged


def delete(user_id: str) -> bool:
    with get_db_session() as session:
        entity = session.get(User, user_id)
        if not entity:
            return False
        session.delete(entity)
        session.flush()
        return True
