from typing import Callable, List, Optional, Tuple, TypeVar

from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from utils.db import get_db_session

T = TypeVar("T")


def find_many_shares(
    model: type[T],
    params: Optional[object],
    params_factory: Callable[[], object],
    resource_attr: str,
) -> Tuple[List[T], int]:
    param = params or params_factory()

    filters = []
    resource_value = getattr(param, resource_attr)
    if resource_value:
        filters.append(getattr(model, resource_attr) == resource_value)
    if param.user_id:
        filters.append(model.user_id == param.user_id)

    stmt = select(model).where(*filters).options(selectinload(model.user))
    order_expr = (
        model.created_at.desc()
        if param.sort_dir == "desc"
        else model.created_at.asc()
    )

    with get_db_session() as session:
        total = session.scalar(
            select(func.count()).select_from(stmt.subquery())
        )
        items = session.scalars(
            stmt.order_by(order_expr).limit(param.limit).offset(param.offset)
        ).all()

    return items, total or 0


def find_shares_by_resource(
    model: type[T],
    resource_attr: str,
    resource_id: str,
) -> List[T]:
    stmt = select(model).where(
        getattr(model, resource_attr) == resource_id
    ).options(selectinload(model.user))
    with get_db_session() as session:
        return session.scalars(stmt).all()


def find_share(
    model: type[T],
    resource_attr: str,
    resource_id: str,
    user_id: str,
) -> Optional[T]:
    stmt = select(model).where(
        getattr(model, resource_attr) == resource_id,
        model.user_id == user_id,
    ).options(selectinload(model.user))
    with get_db_session() as session:
        return session.execute(stmt).scalar_one_or_none()


def add_share(model: type[T], resource_attr: str, share: T) -> T:
    with get_db_session() as session:
        session.add(share)
        session.flush()
        stmt = select(model).where(
            getattr(model, resource_attr) == getattr(share, resource_attr),
            model.user_id == share.user_id,
        ).options(selectinload(model.user))
        return session.execute(stmt).scalar_one()


def update_share(model: type[T], resource_attr: str, share: T) -> T:
    with get_db_session() as session:
        merged: T = session.merge(share)
        session.flush()
        stmt = select(model).where(
            getattr(model, resource_attr) == getattr(merged, resource_attr),
            model.user_id == merged.user_id,
        ).options(selectinload(model.user))
        return session.execute(stmt).scalar_one()


def delete_share(model: type[T], resource_id: str, user_id: str) -> bool:
    with get_db_session() as session:
        share = session.get(model, (resource_id, user_id))
        if not share:
            return False
        session.delete(share)
        session.flush()
        return True
