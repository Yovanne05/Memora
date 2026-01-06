from typing import Tuple

from domain_services.note_domain_service import (
    ensure_not_self_link,
    ensure_note_exists,
    ensure_note_link_does_not_exist,
    ensure_same_collection,
)
from dtos.note_link_dto import NoteLinkCreateDTO, NoteLinkDTO
from exceptions.note_link_exception import NoteLinkNotFound
from mappers.note_link_mapper import dto_to_note_link, note_link_to_dto
from repositorys import note_repository
from repositorys import note_link_repository
from repositorys.note_link_repository import NoteLinkSearchParams
from services.interfaces.note.note_link_service_interface import (
    NoteLinkServiceInterface,
)
from domain_services.permission_domain_service import permission_domain_service
from utils.auth import get_current_user


class NoteLinkService(NoteLinkServiceInterface):
    def find_many(
        self, params: NoteLinkSearchParams
    ) -> Tuple[list[NoteLinkDTO], int]:
        user = get_current_user()
        base_note_id = params.note_id

        if base_note_id and not permission_domain_service.can_read_note(
            base_note_id, user.id, user.role
        ):
            return [], 0

        links, total = note_link_repository.find_many(params)

        accessible_notes = permission_domain_service.get_accessible_note_ids(
            user.id, user.role
        )
        if accessible_notes is not None:
            if not accessible_notes:
                return [], 0
            links = [
                link for link in links
                if link.note_id_1 in accessible_notes or link.note_id_2 in accessible_notes
            ]
            total = len(links)

        return [note_link_to_dto(link, base_note_id) for link in links], total

    def create_link(
        self, note_id: str, payload: NoteLinkCreateDTO
    ) -> NoteLinkDTO:
        source_note = note_repository.find_one_unscoped(note_id)
        ensure_note_exists(source_note)

        target_note = note_repository.find_one_unscoped(payload.linked_note_id)
        ensure_note_exists(target_note)

        ensure_not_self_link(note_id, payload.linked_note_id)
        ensure_same_collection(source_note, target_note)

        existing_link = note_link_repository.find_one(
            note_id, payload.linked_note_id)
        ensure_note_link_does_not_exist(existing_link)

        link_entity = dto_to_note_link(note_id, payload.linked_note_id)
        saved = note_link_repository.add(link_entity)
        return note_link_to_dto(saved, note_id)

    def delete_link(self, note_id: str, linked_note_id: str) -> None:
        note_entity = note_repository.find_one_unscoped(note_id)
        ensure_note_exists(note_entity)

        linked_note_entity = note_repository.find_one_unscoped(linked_note_id)
        ensure_note_exists(linked_note_entity)

        ensure_not_self_link(note_id, linked_note_id)

        note_link_repository.delete(note_id, linked_note_id)


note_link_service = NoteLinkService()
