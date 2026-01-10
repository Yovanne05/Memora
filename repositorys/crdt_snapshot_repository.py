from sqlalchemy import select

from daos.crdt_snapshot_dao import CRDTSnapshot
from utils.db import get_db_session


def find_one_by_note_id(note_id: str) -> CRDTSnapshot | None:
    stmt = select(CRDTSnapshot).where(CRDTSnapshot.note_id == note_id)
    with get_db_session() as session:
        return session.scalar(stmt)


def save_snapshot(
    note_id: str,
    state_vector: bytes,
    document_update: bytes,
) -> bool:
    with get_db_session() as session:
        stmt = select(CRDTSnapshot).where(CRDTSnapshot.note_id == note_id)
        snapshot = session.scalar(stmt)

        if snapshot:
            snapshot.state_vector = state_vector
            snapshot.document_update = document_update
            snapshot.version += 1
        else:
            snapshot = CRDTSnapshot(
                note_id=note_id,
                state_vector=state_vector,
                document_update=document_update,
                version=0,
            )
            session.add(snapshot)

        session.flush()

    return True
