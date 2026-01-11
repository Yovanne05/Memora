from typing import List, Optional

from sqlalchemy import select

from daos.note_image_dao import NoteImage
from utils.db import get_db_session


def find_by_note(note_id: str) -> List[NoteImage]:
    stmt = select(NoteImage).where(NoteImage.note_id == note_id)
    with get_db_session() as session:
        return list(session.scalars(stmt).all())


def find_by_note_and_filename(note_id: str, filename: str) -> Optional[NoteImage]:
    stmt = select(NoteImage).where(
        NoteImage.note_id == note_id,
        NoteImage.file_name == filename
    )
    with get_db_session() as session:
        return session.execute(stmt).scalar_one_or_none()


def add(image: NoteImage) -> NoteImage:
    with get_db_session() as session:
        session.add(image)
        session.flush()
        session.refresh(image)
        return image


def delete(image_id: str) -> bool:
    stmt = select(NoteImage).where(NoteImage.id == image_id)
    with get_db_session() as session:
        entity = session.execute(stmt).scalar_one_or_none()
        if not entity:
            return False
        session.delete(entity)
        session.flush()
        return True
