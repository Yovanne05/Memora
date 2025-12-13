from typing import Optional
from sqlalchemy import inspect
from daos.note_dao import Note
from dtos.note_dto import NoteCreateDTO, NoteDTO


def _get_collection_name(note_entity: Note) -> Optional[str]:
    if not note_entity.collection_id:
        return None

    insp = inspect(note_entity)
    if 'collection' not in insp.unloaded:
        return note_entity.collection.name if note_entity.collection else None

    return None


def note_to_dto_dict(note_entity: Note) -> dict:
    return {
        "id": note_entity.id,
        "title": note_entity.title,
        "content": note_entity.content,
        "visibility": note_entity.visibility,
        "owner_id": note_entity.owner_id,
        "owner_username": note_entity.owner.username,
        "collection_id": note_entity.collection_id,
        "collection_name": _get_collection_name(note_entity),
        "tags": note_entity.tags,
        "created_at": note_entity.created_at,
        "updated_at": note_entity.updated_at,
    }


def note_to_dto(note_entity: Note) -> NoteDTO:
    return NoteDTO.model_validate(note_to_dto_dict(note_entity))


def dto_to_note(note_create_dto: NoteCreateDTO) -> Note:
    return Note(
        title=note_create_dto.title,
        content=note_create_dto.content,
        owner_id=note_create_dto.owner_id,
        collection_id=note_create_dto.collection_id,
        visibility=note_create_dto.visibility,
        tags=note_create_dto.tags,
    )
