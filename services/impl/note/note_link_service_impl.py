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
from services.interfaces.note.note_link_service_interface import (
    NoteLinkServiceInterface,
)


class NoteLinkService(NoteLinkServiceInterface):
    def list_links(self, note_id: str) -> list[NoteLinkDTO]:
        note_entity = note_repository.find_one(note_id)
        ensure_note_exists(note_entity)

        link_entities = note_link_repository.find_by_note(note_id)
        return [note_link_to_dto(entity, note_id) for entity in link_entities]

    def create_link(
        self, note_id: str, payload: NoteLinkCreateDTO
    ) -> NoteLinkDTO:
        source_note = note_repository.find_one(note_id)
        ensure_note_exists(source_note)

        target_note = note_repository.find_one(payload.linked_note_id)
        ensure_note_exists(target_note)

        ensure_not_self_link(note_id, payload.linked_note_id)
        ensure_same_collection(source_note, target_note)

        existing_link = note_link_repository.find_one(note_id, payload.linked_note_id)
        ensure_note_link_does_not_exist(existing_link)

        link_entity = dto_to_note_link(note_id, payload.linked_note_id)
        saved = note_link_repository.add(link_entity)
        return note_link_to_dto(saved, note_id)

    def delete_link(self, note_id: str, linked_note_id: str) -> None:
        note_entity = note_repository.find_one(note_id)
        ensure_note_exists(note_entity)

        linked_note_entity = note_repository.find_one(linked_note_id)
        ensure_note_exists(linked_note_entity)

        ensure_not_self_link(note_id, linked_note_id)

        note_link_repository.delete(note_id, linked_note_id)


note_link_service = NoteLinkService()
