from typing import List, Optional, Tuple

from domain_services.collection_domain_service import (
    apply_collection_update,
    ensure_collection_exists,
)
from domain_services.permission_domain_service import permission_domain_service
from dtos.collection_dto import CollectionCreateDTO, CollectionDTO, CollectionUpdateDTO
from exceptions.collection_exception import CollectionNotFound
from exceptions.permission_exception import ReadPermissionDenied
from mappers.collection_mapper import collection_to_dto, dto_to_collection
from repositorys import collection_favorite_repository, collection_repository
from repositorys import note_favorite_repository
from repositorys.collection_repository import CollectionSearchParams
from services.interfaces.collection.collection_service_interface import (
    CollectionServiceInterface,
)
from utils.auth import get_current_user
from flask_jwt_extended.exceptions import NoAuthorizationError


class CollectionService(CollectionServiceInterface):
    @staticmethod
    def _get_current_user_optional():
        try:
            return get_current_user()
        except (RuntimeError, NoAuthorizationError):
            return None

    def find_many(
        self, params: Optional[CollectionSearchParams] = None
    ) -> Tuple[List[CollectionDTO], int]:
        user = get_current_user()
        entities, total = collection_repository.list_for_user(user, params)
        collection_favorites, note_favorites = self._get_favorite_ids(user.id)
        dtos = [
            collection_to_dto(
                entity,
                collection_favorite_ids=collection_favorites,
                note_favorite_ids=note_favorites,
                current_user=user,
            )
            for entity in entities
        ]
        return dtos, total

    def find_one(self, collection_id: str) -> CollectionDTO:
        user = get_current_user()

        if not permission_domain_service.can_read_collection(
            collection_id, user.id, user.role
        ):
            raise ReadPermissionDenied("collection", collection_id)

        collection_entity = collection_repository.find_one_unscoped(collection_id)
        ensure_collection_exists(collection_entity)

        collection_favorites, note_favorites = self._get_favorite_ids(user.id)
        return collection_to_dto(
            collection_entity,
            collection_favorite_ids=collection_favorites,
            note_favorite_ids=note_favorites,
            current_user=user,
        )

    def create(self, collection_create_dto: CollectionCreateDTO) -> CollectionDTO:
        user = self._get_current_user_optional()
        entity = dto_to_collection(collection_create_dto)
        saved = collection_repository.add(entity)
        return collection_to_dto(saved, current_user=user)

    def update(
        self, collection_id: str, collection_update_dto: CollectionUpdateDTO
    ) -> CollectionDTO:
        user = self._get_current_user_optional()
        collection_entity = collection_repository.find_one_unscoped(collection_id)
        ensure_collection_exists(collection_entity)

        updated_entity = apply_collection_update(
            collection_entity, collection_update_dto
        )
        saved = collection_repository.update(updated_entity)
        return collection_to_dto(saved, current_user=user)

    def delete(self, collection_id: str) -> None:
        deleted = collection_repository.delete(collection_id)
        if not deleted:
            raise CollectionNotFound()

    def _get_favorite_ids(self, user_id: str) -> tuple[set[str], set[str]]:
        collection_favorites = (
            collection_favorite_repository.favorite_collection_ids_for_user(user_id)
        )
        note_favorites = note_favorite_repository.favorite_note_ids_for_user(
            user_id
        )
        return collection_favorites, note_favorites


collection_service = CollectionService()
