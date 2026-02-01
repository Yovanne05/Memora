from daos.note_dao import NoteShare
from dtos.note_share_dto import NoteShareCreateDTO, NoteShareDTO


def note_share_to_dto(share_entity: NoteShare) -> NoteShareDTO:
    return NoteShareDTO.model_validate(share_entity)


def dto_to_note_share(
    note_id: str, share_create_dto: NoteShareCreateDTO
) -> NoteShare:
    return NoteShare(
        note_id=note_id,
        user_id=share_create_dto.user_id,
        permission=share_create_dto.permission,
    )
