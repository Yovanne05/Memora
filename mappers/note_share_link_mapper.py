from daos.note_share_link_dao import NoteShareLink
from dtos.note_share_link_dto import NoteShareLinkCreateDTO, NoteShareLinkDTO


def note_share_link_to_dto(share_link_entity: NoteShareLink) -> NoteShareLinkDTO:
    return NoteShareLinkDTO.model_validate(share_link_entity)


def dto_to_note_share_link(
    note_id: str, share_link_create_dto: NoteShareLinkCreateDTO
) -> NoteShareLink:
    return NoteShareLink(
        note_id=note_id,
        permission=share_link_create_dto.permission,
    )
