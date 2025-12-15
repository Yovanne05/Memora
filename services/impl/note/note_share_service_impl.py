from typing import List

from domain_services.note_domain_service import (
    ensure_not_sharing_with_owner,
    ensure_note_exists,
    ensure_note_share_does_not_exist,
    ensure_share_target_exists,
)
from dtos.note_share_dto import (
    NoteShareCreateDTO,
    NoteShareDTO,
    NoteShareUpdateDTO,
)
from exceptions.note_share_exception import NoteShareNotFound
from mappers.note_share_mapper import dto_to_note_share, note_share_to_dto
from repositorys import note_repository, note_share_repository, user_repository
from services.interfaces.note.note_share_service_interface import (
    NoteShareServiceInterface,
)


class NoteShareService(NoteShareServiceInterface):
    def list_shares(self, note_id: str) -> List[NoteShareDTO]:
        note_entity = note_repository.find_one(note_id)
        ensure_note_exists(note_entity)

        share_entities = note_share_repository.find_by_note(note_id)
        return [note_share_to_dto(entity) for entity in share_entities]

    def share_note(
        self, note_id: str, share_dto: NoteShareCreateDTO
    ) -> NoteShareDTO:
        note_entity = note_repository.find_one(note_id)
        ensure_note_exists(note_entity)

        user_entity = user_repository.find_one(share_dto.user_id)
        ensure_share_target_exists(user_entity)

        ensure_not_sharing_with_owner(note_entity.owner_id, share_dto.user_id)

        existing_share = note_share_repository.find_one(note_id, share_dto.user_id)
        ensure_note_share_does_not_exist(existing_share)

        share_entity = dto_to_note_share(note_id, share_dto)
        saved = note_share_repository.add(share_entity)
        return note_share_to_dto(saved)

    def update_share(
        self, note_id: str, user_id: str, share_update_dto: NoteShareUpdateDTO
    ) -> NoteShareDTO:
        note_entity = note_repository.find_one(note_id)
        ensure_note_exists(note_entity)

        share_entity = note_share_repository.find_one(note_id, user_id)
        if not share_entity:
            raise NoteShareNotFound()

        share_entity.permission = share_update_dto.permission
        saved = note_share_repository.update(share_entity)
        return note_share_to_dto(saved)

    def revoke_share(self, note_id: str, user_id: str) -> None:
        note_entity = note_repository.find_one(note_id)
        ensure_note_exists(note_entity)

        deleted = note_share_repository.delete(note_id, user_id)
        if not deleted:
            raise NoteShareNotFound()


note_share_service = NoteShareService()
