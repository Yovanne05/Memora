from daos.note_dao import NoteLink
from dtos.note_link_dto import NoteLinkCreateDTO, NoteLinkDTO


def note_link_to_dto(
    link_entity: NoteLink,
    base_note_id: str | None = None,
) -> NoteLinkDTO:
    if base_note_id:
        current_id = base_note_id

        if link_entity.note_id_1 == base_note_id:
            linked_id = link_entity.note_id_2
        elif link_entity.note_id_2 == base_note_id:
            linked_id = link_entity.note_id_1
        else:
            linked_id = link_entity.note_id_2
    else:
        current_id = link_entity.note_id_1
        linked_id = link_entity.note_id_2

    return NoteLinkDTO(
        note_id=current_id,
        linked_note_id=linked_id,
        label=link_entity.label,
        created_at=link_entity.created_at,
    )


def dto_to_note_link(note_id_1: str, payload: NoteLinkCreateDTO) -> NoteLink:
    return NoteLink(
        note_id_1=note_id_1,
        note_id_2=payload.linked_note_id,
        label=payload.label,
    )
