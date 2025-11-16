from typing import List, Optional

from sqlalchemy import select

from daos.note_dao import NoteShare
from utils.db import get_db_session


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
