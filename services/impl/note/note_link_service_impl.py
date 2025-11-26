from daos.note_dao import Note
from dtos.note_link_dto import NoteLinkCreateDTO, NoteLinkDTO
from exceptions.note_exception import (
    NoteLinkAlreadyExists,
    NoteLinkCrossCollection,
    NoteLinkNotFound,
    NoteLinkSelfReferenceForbidden,
    NoteNotFound,
)
from mappers.note_link_mapper import dto_to_note_link, note_link_to_dto
from repositorys import note_repository
from repositorys import note_link_repository
from services.interfaces.note.note_link_service_interface import (
    NoteLinkServiceInterface,
)


class NoteLinkService(NoteLinkServiceInterface):
    def list_links(self, note_id: str) -> list[NoteLinkDTO]:
        self._get_note_or_raise(note_id)
        link_entities = note_link_repository.find_by_note(note_id)
        return [note_link_to_dto(entity, note_id) for entity in link_entities]

    def create_link(
        self, note_id: str, payload: NoteLinkCreateDTO
    ) -> NoteLinkDTO:
        source_note = self._get_note_or_raise(note_id)
        target_note = self._get_note_or_raise(payload.linked_note_id)

        self._ensure_not_self(note_id, payload.linked_note_id)
        self._ensure_same_collection(source_note, target_note)
        self._ensure_link_does_not_exist(note_id, payload.linked_note_id)

        link_entity = dto_to_note_link(note_id, payload.linked_note_id)
        saved = note_link_repository.add(link_entity)
        return note_link_to_dto(saved, note_id)

    def delete_link(self, note_id: str, linked_note_id: str) -> None:
        self._get_note_or_raise(note_id)
        self._ensure_not_self(note_id, linked_note_id)

        deleted = note_link_repository.delete(note_id, linked_note_id)
        if not deleted:
            raise NoteLinkNotFound()

    def _get_note_or_raise(self, note_id: str) -> Note:
        note_entity = note_repository.find_one(note_id)
        if not note_entity:
            raise NoteNotFound()
        return note_entity

    def _ensure_not_self(
        self, note_id: str, linked_note_id: str
    ) -> None:
        if note_id == linked_note_id:
            raise NoteLinkSelfReferenceForbidden()

    def _ensure_same_collection(
        self, first: Note, second: Note
    ) -> None:
        if not first.collection_id or not second.collection_id:
            raise NoteLinkCrossCollection()

        if first.collection_id != second.collection_id:
            raise NoteLinkCrossCollection()

    def _ensure_link_does_not_exist(
        self, note_id: str, linked_note_id: str
    ) -> None:
        existing = note_link_repository.find_one(note_id, linked_note_id)
        if existing:
            raise NoteLinkAlreadyExists()


note_link_service = NoteLinkService()
