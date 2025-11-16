from typing import List, Optional, Tuple

from domain_services.note_domain_service import apply_note_update
from dtos.note_dto import NoteCreateDTO, NoteDTO, NoteUpdateDTO
from exceptions.note_exception import (
    NoteCollectionDoesNotExist,
    NoteNotFound,
    NoteOwnerDoesNotExist,
    NoteTitleConflict,
)
from mappers.note_mapper import dto_to_note, note_to_dto
from repositorys import collection_repository, note_repository, user_repository
from repositorys.note_repository import NoteSearchParams
from services.interfaces.note.note_crud_service_interface import (
    NoteCrudServiceInterface,
)


class NoteCrudService(NoteCrudServiceInterface):
    def find_many(
        self, params: Optional[NoteSearchParams] = None
    ) -> Tuple[List[NoteDTO], int]:
        entities, total = note_repository.find_many(params)
        return [note_to_dto(entity) for entity in entities], total

    def find_one(self, note_id: str) -> NoteDTO:
        note_entity = self._get_note_or_raise(note_id)
        return note_to_dto(note_entity)

    def create(self, note_create_dto: NoteCreateDTO) -> NoteDTO:
        self._ensure_owner_exists(note_create_dto.owner_id)
        if note_create_dto.collection_id:
            self._ensure_collection_allowed(
                note_create_dto.owner_id, note_create_dto.collection_id
            )
        self._ensure_unique_title(
            note_create_dto.owner_id,
            note_create_dto.collection_id,
            note_create_dto.title,
        )

        entity = dto_to_note(note_create_dto)
        saved = note_repository.add(entity)
        return note_to_dto(saved)

    def update(
        self, note_id: str, note_update_dto: NoteUpdateDTO
    ) -> NoteDTO:
        note_entity = self._get_note_or_raise(note_id)

        if "collection_id" in note_update_dto.model_fields_set:
            new_collection_id = note_update_dto.collection_id
            if new_collection_id:
                self._ensure_collection_allowed(
                    note_entity.owner_id, new_collection_id
                )

        future_collection_id = (
            note_update_dto.collection_id
            if "collection_id" in note_update_dto.model_fields_set
            else note_entity.collection_id
        )
        future_title = (
            note_update_dto.title
            if note_update_dto.title is not None
            else note_entity.title
        )

        self._ensure_unique_title(
            note_entity.owner_id,
            future_collection_id,
            future_title,
            note_entity.id,
        )

        updated_entity = apply_note_update(note_entity, note_update_dto)
        saved = note_repository.update(updated_entity)
        return note_to_dto(saved)

    def delete(self, note_id: str) -> None:
        deleted = note_repository.delete(note_id)
        if not deleted:
            raise NoteNotFound()

    def _get_note_or_raise(self, note_id: str):
        note_entity = note_repository.find_one(note_id)
        if not note_entity:
            raise NoteNotFound()
        return note_entity

    def _ensure_owner_exists(self, owner_id: str) -> None:
        if not user_repository.find_one(owner_id):
            raise NoteOwnerDoesNotExist()

    def _ensure_collection_allowed(
        self, owner_id: str, collection_id: str
    ) -> None:
        collection = collection_repository.find_for_owner(
            collection_id, owner_id
        )
        if not collection:
            raise NoteCollectionDoesNotExist()

    def _ensure_unique_title(
        self,
        owner_id: str,
        collection_id: str | None,
        title: str,
        exclude_id: str | None = None,
    ) -> None:
        existing = note_repository.find_one_by_title(
            owner_id,
            collection_id,
            title,
        )
        if existing and existing.id != exclude_id:
            raise NoteTitleConflict()


note_crud_service = NoteCrudService()
