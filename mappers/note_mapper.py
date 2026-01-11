from typing import Optional

from sqlalchemy import inspect

from daos.note_dao import Note
from dtos.note_dto import NoteCreateDTO, NoteDTO
from mappers.base_mapper import BaseResourceMapper


def _safe_collection_name(note: Note) -> Optional[str]:
    if not note.collection_id:
        return None
    insp = inspect(note)
    if "collection" in insp.unloaded:
        return None
    return note.collection.name if note.collection else None


def _safe_owner_username(note: Note) -> str:
    insp = inspect(note)
    if "owner" in insp.unloaded or not note.owner:
        return ""
    return note.owner.username or ""


def note_to_dto(
    note: Note,
    favorite_note_ids: set[str] | None = None,
    current_user=None,
) -> NoteDTO:
    data = {
        "id": note.id,
        "owner_id": note.owner_id,
        "owner_username": _safe_owner_username(note),
        "title": note.title,
        "visibility": note.visibility,
        "collection_id": note.collection_id,
        "tags": note.tags,
        "created_at": note.created_at,
        "updated_at": note.updated_at,
        "collection_name": _safe_collection_name(note),
    }

    BaseResourceMapper.add_user_context(
        data,
        note,
        favorite_ids=favorite_note_ids,
        current_user=current_user,
    )
    return NoteDTO.model_validate(data)


def dto_to_note(note_create_dto: NoteCreateDTO) -> Note:
    return Note(
        title=note_create_dto.title,
        owner_id=note_create_dto.owner_id,
        collection_id=note_create_dto.collection_id,
        visibility=note_create_dto.visibility,
        tags=note_create_dto.tags
    )
