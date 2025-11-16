from daos.note_dao import Note
from dtos.note_dto import NoteCreateDTO, NoteDTO


def note_to_dto(note_entity: Note) -> NoteDTO:
    return NoteDTO.model_validate(note_entity)


def dto_to_note(note_create_dto: NoteCreateDTO) -> Note:
    return Note(
        title=note_create_dto.title,
        content=note_create_dto.content,
        owner_id=note_create_dto.owner_id,
        collection_id=note_create_dto.collection_id,
        visibility=note_create_dto.visibility,
    )
