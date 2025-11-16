from typing import List

from dtos.note_share_dto import (
    NoteShareCreateDTO,
    NoteShareDTO,
    NoteShareUpdateDTO,
)
from exceptions.note_exception import (
    NoteNotFound,
    NoteShareAlreadyExists,
    NoteShareNotFound,
    NoteShareTargetDoesNotExist,
    NoteShareWithOwnerForbidden,
)
from mappers.note_share_mapper import dto_to_note_share, note_share_to_dto
from repositorys import note_repository, note_share_repository, user_repository
from services.interfaces.note.note_share_service_interface import (
    NoteShareServiceInterface,
)


class NoteShareService(NoteShareServiceInterface):
    def list_shares(self, note_id: str) -> List[NoteShareDTO]:
        self._get_note_or_raise(note_id)
        share_entities = note_share_repository.find_by_note(note_id)
        return [note_share_to_dto(entity) for entity in share_entities]

    def share_note(
        self, note_id: str, share_dto: NoteShareCreateDTO
    ) -> NoteShareDTO:
        note_entity = self._get_note_or_raise(note_id)
        self._ensure_share_target_exists(share_dto.user_id)
        self._ensure_not_owner(note_entity.owner_id, share_dto.user_id)
        self._ensure_share_does_not_exist(note_id, share_dto.user_id)

        share_entity = dto_to_note_share(note_id, share_dto)
        saved = note_share_repository.add(share_entity)
        return note_share_to_dto(saved)

    def update_share(
        self, note_id: str, user_id: str, share_update_dto: NoteShareUpdateDTO
    ) -> NoteShareDTO:
        self._get_note_or_raise(note_id)
        share_entity = note_share_repository.find_one(note_id, user_id)
        if not share_entity:
            raise NoteShareNotFound()

        share_entity.permission = share_update_dto.permission
        saved = note_share_repository.update(share_entity)
        return note_share_to_dto(saved)

    def revoke_share(self, note_id: str, user_id: str) -> None:
        self._get_note_or_raise(note_id)
        deleted = note_share_repository.delete(note_id, user_id)
        if not deleted:
            raise NoteShareNotFound()

    def _get_note_or_raise(self, note_id: str):
        note_entity = note_repository.find_one(note_id)
        if not note_entity:
            raise NoteNotFound()
        return note_entity

    def _ensure_share_target_exists(self, user_id: str) -> None:
        if not user_repository.find_one(user_id):
            raise NoteShareTargetDoesNotExist()

    def _ensure_not_owner(
        self, owner_id: str, target_user_id: str
    ) -> None:
        if owner_id == target_user_id:
            raise NoteShareWithOwnerForbidden()

    def _ensure_share_does_not_exist(
        self, note_id: str, user_id: str
    ) -> None:
        existing = note_share_repository.find_one(note_id, user_id)
        if existing:
            raise NoteShareAlreadyExists()


note_share_service = NoteShareService()
