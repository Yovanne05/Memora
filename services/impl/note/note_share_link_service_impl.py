from typing import List, Tuple

from domain_services.note_domain_service import ensure_note_exists
from dtos.note_share_link_dto import NoteShareLinkCreateDTO, NoteShareLinkDTO
from exceptions.note_share_link_exception import NoteShareLinkNotFound
from mappers.note_share_link_mapper import (
    dto_to_note_share_link,
    note_share_link_to_dto,
)
from repositorys import note_repository, note_share_link_repository
from repositorys.note_share_link_repository import NoteShareLinkSearchParams
from services.interfaces.note.note_share_link_service_interface import (
    NoteShareLinkServiceInterface,
)
from utils.auth import get_current_user


class NoteShareLinkService(NoteShareLinkServiceInterface):
    def find_many(
        self, params: NoteShareLinkSearchParams
    ) -> Tuple[List[NoteShareLinkDTO], int]:
        user = get_current_user()
        share_links, total = note_share_link_repository.find_many(params)

        # Filter to only include links for notes owned by current user
        filtered_links = [
            link for link in share_links
            if self._user_owns_note(user.id, link.note_id)
        ]

        return (
            [note_share_link_to_dto(link) for link in filtered_links],
            len(filtered_links),
        )

    def _user_owns_note(self, user_id: str, note_id: str) -> bool:
        note = note_repository.find_one_unscoped(note_id)
        return note is not None and note.owner_id == user_id

    def create_share_link(
        self, note_id: str, share_link_dto: NoteShareLinkCreateDTO
    ) -> NoteShareLinkDTO:
        note_entity = note_repository.find_one_unscoped(note_id)
        ensure_note_exists(note_entity)

        share_link_entity = dto_to_note_share_link(note_id, share_link_dto)
        saved = note_share_link_repository.add(share_link_entity)
        return note_share_link_to_dto(saved)

    def delete_share_link(self, note_id: str, link_id: str) -> None:
        note_entity = note_repository.find_one_unscoped(note_id)
        ensure_note_exists(note_entity)

        deleted = note_share_link_repository.delete(link_id)
        if not deleted:
            raise NoteShareLinkNotFound()


note_share_link_service = NoteShareLinkService()
