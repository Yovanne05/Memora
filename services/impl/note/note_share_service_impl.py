from typing import List, Tuple

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
from repositorys.note_share_repository import NoteShareSearchParams
from services.interfaces.note.note_share_service_interface import (
    NoteShareServiceInterface,
)
from utils.auth import get_current_user
from utils.access_scope import accessible_note_ids, is_note_owner


class NoteShareService(NoteShareServiceInterface):
    def find_many(self, params: NoteShareSearchParams) -> Tuple[List[NoteShareDTO], int]:
        user = get_current_user()
        shares, total = note_share_repository.find_many(params)
        allowed_notes = accessible_note_ids(user)
        if allowed_notes is not None:
            if not allowed_notes:
                return [], 0
            shares = [share for share in shares if share.note_id in allowed_notes]
            total = len(shares)
        return [note_share_to_dto(share) for share in shares], total

    def share_note(
        self, note_id: str, share_dto: NoteShareCreateDTO
    ) -> NoteShareDTO:
        current_user = get_current_user()

        note_entity = note_repository.find_one_unscoped(note_id)
        ensure_note_exists(note_entity)

        if not is_note_owner(current_user, note_id):
            from exceptions.note_share_exception import NoteSharePermissionDenied
            raise NoteSharePermissionDenied()

        user_entity = user_repository.find_one(share_dto.user_id)
        ensure_share_target_exists(user_entity)

        ensure_not_sharing_with_owner(note_entity.owner_id, share_dto.user_id)

        existing_share = note_share_repository.find_one(
            note_id, share_dto.user_id)
        ensure_note_share_does_not_exist(existing_share)

        share_entity = dto_to_note_share(note_id, share_dto)
        saved = note_share_repository.add(share_entity)
        return note_share_to_dto(saved)

    def update_share(
        self, note_id: str, user_id: str, share_update_dto: NoteShareUpdateDTO
    ) -> NoteShareDTO:
        current_user = get_current_user()

        note_entity = note_repository.find_one_unscoped(note_id)
        ensure_note_exists(note_entity)

        if not is_note_owner(current_user, note_id):
            from exceptions.note_share_exception import NoteSharePermissionDenied
            raise NoteSharePermissionDenied()

        share_entity = note_share_repository.find_one(note_id, user_id)
        if not share_entity:
            raise NoteShareNotFound()

        share_entity.permission = share_update_dto.permission
        saved = note_share_repository.update(share_entity)
        return note_share_to_dto(saved)

    def revoke_share(self, note_id: str, user_id: str) -> None:
        current_user = get_current_user()

        note_entity = note_repository.find_one_unscoped(note_id)
        ensure_note_exists(note_entity)

        if not is_note_owner(current_user, note_id):
            from exceptions.note_share_exception import NoteSharePermissionDenied
            raise NoteSharePermissionDenied()

        deleted = note_share_repository.delete(note_id, user_id)
        if not deleted:
            raise NoteShareNotFound()


note_share_service = NoteShareService()
