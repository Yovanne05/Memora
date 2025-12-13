from typing import Optional
from daos.note_dao import Note
from dtos.note_dto import NoteCreateDTO, NoteDTO
from typing import Optional
from sqlalchemy import inspect 
from daos.note_dao import Note
from dtos.note_dto import NoteDTO


def _safe_owner_username(note: Note) -> Optional[str]:
    insp = inspect(note)
    if "owner" in insp.unloaded:
        return None
    return note.owner.username if note.owner else None


def _safe_collection_name(note: Note) -> Optional[str]:
    if not note.collection_id:
        return None
    insp = inspect(note)
    if "collection" in insp.unloaded:
        return None
    return note.collection.name if note.collection else None


def note_to_dto(note: Note) -> NoteDTO:
    data = {
        "id": note.id,
        "title": note.title,
        "content": note.content,
        "visibility": note.visibility,
        "owner_id": note.owner_id,
        "collection_id": note.collection_id,
        "tags": note.tags,
        "created_at": note.created_at,
        "updated_at": note.updated_at,
        "owner_username": _safe_owner_username(note),
        "collection_name": _safe_collection_name(note),
    }
    return NoteDTO.model_validate(data)


def dto_to_note(note_create_dto: NoteCreateDTO) -> Note:
    return Note(
        title=note_create_dto.title,
        content=note_create_dto.content,
        owner_id=note_create_dto.owner_id,
        collection_id=note_create_dto.collection_id,
        visibility=note_create_dto.visibility,
        tags=note_create_dto.tags,
    )
