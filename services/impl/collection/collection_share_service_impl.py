from typing import List

from dtos.collection_share_dto import (
    CollectionShareCreateDTO,
    CollectionShareDTO,
    CollectionShareUpdateDTO,
)
from exceptions.collection_exception import (
    CollectionNotFound,
    CollectionShareAlreadyExists,
    CollectionShareNotFound,
    CollectionShareTargetDoesNotExist,
    CollectionShareWithOwnerForbidden,
)
from mappers.collection_share_mapper import (
    collection_share_to_dto,
    dto_to_collection_share,
)
from repositorys import (
    collection_repository,
    collection_share_repository,
    user_repository,
)
from services.interfaces.collection.collection_share_service_interface import CollectionShareServiceInterface


class CollectionShareService(CollectionShareServiceInterface):
    def list_shares(self, collection_id: str) -> List[CollectionShareDTO]:
        self._get_collection_or_raise(collection_id)
        share_entities = collection_share_repository.find_by_collection(
            collection_id
        )
        return [
            collection_share_to_dto(entity) for entity in share_entities
        ]

    def share_collection(
        self, collection_id: str, share_dto: CollectionShareCreateDTO
    ) -> CollectionShareDTO:
        collection_entity = self._get_collection_or_raise(collection_id)
        self._ensure_share_target_exists(share_dto.user_id)
        self._ensure_not_owner(collection_entity.owner_id, share_dto.user_id)
        self._ensure_share_does_not_exist(collection_id, share_dto.user_id)

        share_entity = dto_to_collection_share(collection_id, share_dto)
        saved = collection_share_repository.add(share_entity)
        return collection_share_to_dto(saved)

    def update_share(
        self, collection_id: str, user_id: str, share_update_dto: CollectionShareUpdateDTO
    ) -> CollectionShareDTO:
        self._get_collection_or_raise(collection_id)
        share_entity = collection_share_repository.find_one(
            collection_id, user_id
        )
        if not share_entity:
            raise CollectionShareNotFound()

        share_entity.permission = share_update_dto.permission
        saved = collection_share_repository.update(share_entity)
        return collection_share_to_dto(saved)

    def revoke_share(self, collection_id: str, user_id: str) -> None:
        self._get_collection_or_raise(collection_id)
        deleted = collection_share_repository.delete(collection_id, user_id)
        if not deleted:
            raise CollectionShareNotFound()

    def _get_collection_or_raise(self, collection_id: str):
        collection_entity = collection_repository.find_one(collection_id)
        if not collection_entity:
            raise CollectionNotFound()
        return collection_entity

    def _ensure_share_target_exists(self, user_id: str) -> None:
        if not user_repository.find_one(user_id):
            raise CollectionShareTargetDoesNotExist()

    def _ensure_not_owner(self, owner_id: str, target_user_id: str) -> None:
        if owner_id == target_user_id:
            raise CollectionShareWithOwnerForbidden()

    def _ensure_share_does_not_exist(
        self, collection_id: str, user_id: str
    ) -> None:
        existing = collection_share_repository.find_one(collection_id, user_id)
        if existing:
            raise CollectionShareAlreadyExists()


collection_share_service = CollectionShareService()
