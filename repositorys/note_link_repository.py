from typing import List, Optional, Tuple

from sqlalchemy import or_, select

from daos.note_dao import NoteLink
from utils.db import get_db_session


def _normalize_ids(note_id_1: str, note_id_2: str) -> Tuple[str, str]:
    return tuple(sorted((note_id_1, note_id_2)))


def find_by_note(note_id: str) -> List[NoteLink]:
    stmt = select(NoteLink).where(
        or_(NoteLink.note_id_1 == note_id, NoteLink.note_id_2 == note_id)
    )
    with get_db_session() as session:
        return session.scalars(stmt).all()


def find_one(note_id_1: str, note_id_2: str) -> Optional[NoteLink]:
    normalized = _normalize_ids(note_id_1, note_id_2)
    stmt = select(NoteLink).where(
        NoteLink.note_id_1 == normalized[0],
        NoteLink.note_id_2 == normalized[1],
    )
    with get_db_session() as session:
        return session.execute(stmt).scalar_one_or_none()


def add(link: NoteLink) -> NoteLink:
    normalized = _normalize_ids(link.note_id_1, link.note_id_2)
    link.note_id_1, link.note_id_2 = normalized

    with get_db_session() as session:
        session.add(link)
        session.flush()
        session.refresh(link)
        return link


def delete(note_id_1: str, note_id_2: str) -> bool:
    normalized = _normalize_ids(note_id_1, note_id_2)
    stmt = select(NoteLink).where(
        NoteLink.note_id_1 == normalized[0],
        NoteLink.note_id_2 == normalized[1],
    )
    with get_db_session() as session:
        entity = session.execute(stmt).scalar_one_or_none()
        if not entity:
            return False
        session.delete(entity)
        session.flush()
        return True
