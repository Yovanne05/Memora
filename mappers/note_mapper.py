from sqlalchemy import inspect
from daos.note_dao import Note
from dtos.note_dto import NoteCreateDTO, NoteDTO


def note_to_dto(note_entity: Note) -> NoteDTO:
    # Safely get collection name - check if relationship is loaded
    collection_name = None
    if note_entity.collection_id:
        # Check if the collection relationship is already loaded
        insp = inspect(note_entity)
        if 'collection' not in insp.unloaded:
            collection_name = note_entity.collection.name if note_entity.collection else None

    return NoteDTO.model_validate(
        {
            "id": note_entity.id,
            "title": note_entity.title,
            "content": note_entity.content,
            "visibility": note_entity.visibility,
            "owner_id": note_entity.owner_id,
            "owner_username": note_entity.owner.username,
            "collection_id": note_entity.collection_id,
            "collection_name": collection_name,
            "tags": note_entity.tags,
            "created_at": note_entity.created_at,
            "updated_at": note_entity.updated_at,
        }
    )


def dto_to_note(note_create_dto: NoteCreateDTO) -> Note:
    return Note(
        title=note_create_dto.title,
        content=note_create_dto.content,
        owner_id=note_create_dto.owner_id,
        collection_id=note_create_dto.collection_id,
        visibility=note_create_dto.visibility,
        tags=note_create_dto.tags,
    )
