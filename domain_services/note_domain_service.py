from daos.note_dao import Note
from dtos.note_dto import NoteUpdateDTO


def apply_note_update(note_entity: Note, note_update_dto: NoteUpdateDTO) -> Note:
    if note_update_dto.title is not None:
        note_entity.title = note_update_dto.title

    if note_update_dto.content is not None:
        note_entity.content = note_update_dto.content

    if note_update_dto.visibility is not None:
        note_entity.visibility = note_update_dto.visibility

    if "collection_id" in note_update_dto.model_fields_set:
        note_entity.collection_id = note_update_dto.collection_id

    return note_entity
