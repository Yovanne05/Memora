from typing import List, Optional, Tuple

from domain_services.note_domain_service import (
    apply_note_update,
    ensure_collection_allowed,
    ensure_collection_change_allowed,
    ensure_note_exists,
    ensure_owner_exists,
    ensure_unique_title,
)
from domain_services.permission_domain_service import permission_domain_service
from dtos.note_dto import NoteCreateDTO, NoteDTO, NoteUpdateDTO
from exceptions.note_exception import NoteNotFound
from exceptions.permission_exception import WritePermissionDenied
from mappers.note_mapper import dto_to_note, note_to_dto
from repositorys import (
    collection_repository,
    note_favorite_repository,
    note_link_repository,
    note_repository,
    user_repository,
)
from repositorys.note_repository import NoteSearchParams
from services.interfaces.note.note_crud_service_interface import (
    NoteCrudServiceInterface,
)
from utils.auth import get_current_user


class NoteCrudService(NoteCrudServiceInterface):
    def find_many(
        self, params: Optional[NoteSearchParams] = None
    ) -> Tuple[List[NoteDTO], int]:
        user = get_current_user()
        entities, total = note_repository.list_for_user(user, params)
        favorite_ids = note_favorite_repository.favorite_note_ids_for_user(user.id)
        dtos = [
            note_to_dto(entity, favorite_note_ids=favorite_ids, current_user=user)
            for entity in entities
        ]
        return dtos, total

    def find_one(self, note_id: str) -> NoteDTO:
        user = get_current_user()
        note_entity = note_repository.get_for_user(user, note_id)
        ensure_note_exists(note_entity)
        favorite_ids = note_favorite_repository.favorite_note_ids_for_user(user.id)
        return note_to_dto(
            note_entity,
            favorite_note_ids=favorite_ids,
            current_user=user,
        )

    def create(self, note_create_dto: NoteCreateDTO) -> NoteDTO:
        user_entity = user_repository.find_one(note_create_dto.owner_id)
        ensure_owner_exists(user_entity)

        if note_create_dto.collection_id:
            collection_entity = collection_repository.find_for_owner(
                note_create_dto.collection_id, note_create_dto.owner_id
            )
            ensure_collection_allowed(collection_entity)

        existing_note = note_repository.find_one_by_title(
            note_create_dto.owner_id,
            note_create_dto.collection_id,
            note_create_dto.title,
        )
        ensure_unique_title(existing_note)

        entity = dto_to_note(note_create_dto)
        saved = note_repository.add(entity)
        return note_to_dto(saved)

    def update(
        self, note_id: str, note_update_dto: NoteUpdateDTO
    ) -> NoteDTO:
        note_entity = note_repository.find_one_unscoped(note_id)
        ensure_note_exists(note_entity)

        if "collection_id" in note_update_dto.model_fields_set:
            new_collection_id = note_update_dto.collection_id
            if new_collection_id:
                collection_entity = collection_repository.find_for_owner(
                    new_collection_id, note_entity.owner_id
                )
                ensure_collection_allowed(collection_entity)
            if note_entity.collection_id != new_collection_id:
                note_links = note_link_repository.find_by_note(note_entity.id)
                ensure_collection_change_allowed(note_links)

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

        existing_note = note_repository.find_one_by_title(
            note_entity.owner_id,
            future_collection_id,
            future_title,
        )
        ensure_unique_title(existing_note, note_entity.id)

        updated_entity = apply_note_update(note_entity, note_update_dto)
        saved = note_repository.update(updated_entity)
        return note_to_dto(saved)

    def delete(self, note_id: str) -> None:
        deleted = note_repository.delete(note_id)
        if not deleted:
            raise NoteNotFound()


note_crud_service = NoteCrudService()
