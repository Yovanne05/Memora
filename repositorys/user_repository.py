from typing import Optional
from sqlalchemy import select
from daos.user_dao import User
from utils.db import get_db_session


def find_one(user_id: str) -> Optional[User]:
    with get_db_session() as session:
        return session.get(User, user_id)


def find_by_email(email: str) -> Optional[User]:
    stmt = select(User).where(User.email == email)
    with get_db_session() as session:
        return session.execute(stmt).scalar_one_or_none()
