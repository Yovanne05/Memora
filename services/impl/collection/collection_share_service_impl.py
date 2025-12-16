from typing import List, Tuple

from domain_services.collection_domain_service import (
    ensure_collection_exists,
    ensure_not_sharing_with_owner,
    ensure_share_does_not_exist,
    ensure_user_exists,
)
from dtos.collection_share_dto import (
    CollectionShareCreateDTO,
    CollectionShareDTO,
    CollectionShareUpdateDTO,
)
from exceptions.collection_exception import CollectionShareNotFound
from mappers.collection_share_mapper import (
    collection_share_to_dto,
    dto_to_collection_share,
)
from repositorys import (
    collection_repository,
    collection_share_repository,
    user_repository,
)
from repositorys.collection_share_repository import CollectionShareSearchParams
from services.interfaces.collection.collection_share_service_interface import CollectionShareServiceInterface
from utils.auth import get_current_user
from utils.access_scope import accessible_collection_ids


class CollectionShareService(CollectionShareServiceInterface):
    def find_many(self, params: CollectionShareSearchParams) -> Tuple[List[CollectionShareDTO], int]:
        user = get_current_user()
        shares, total = collection_share_repository.find_many(params)
        allowed_collections = accessible_collection_ids(user)
        if allowed_collections is not None:
            if not allowed_collections:
                return [], 0
            shares = [
                share for share in shares if share.collection_id in allowed_collections
            ]
            total = len(shares)
        return [collection_share_to_dto(share) for share in shares], total

    def share_collection(
        self, collection_id: str, share_dto: CollectionShareCreateDTO
    ) -> CollectionShareDTO:
        collection_entity = collection_repository.find_one_unscoped(collection_id)
        ensure_collection_exists(collection_entity)

        user_entity = user_repository.find_one(share_dto.user_id)
        ensure_user_exists(user_entity)

        ensure_not_sharing_with_owner(
            collection_entity.owner_id, share_dto.user_id)

        existing_share = collection_share_repository.find_one(
            collection_id, share_dto.user_id)
        ensure_share_does_not_exist(existing_share)

        share_entity = dto_to_collection_share(collection_id, share_dto)
        saved = collection_share_repository.add(share_entity)
        return collection_share_to_dto(saved)

    def update_share(
        self, collection_id: str, user_id: str, share_update_dto: CollectionShareUpdateDTO
    ) -> CollectionShareDTO:
        collection_entity = collection_repository.find_one_unscoped(collection_id)
        ensure_collection_exists(collection_entity)

        share_entity = collection_share_repository.find_one(
            collection_id, user_id
        )
        if not share_entity:
            raise CollectionShareNotFound()

        share_entity.permission = share_update_dto.permission
        saved = collection_share_repository.update(share_entity)
        return collection_share_to_dto(saved)

    def revoke_share(self, collection_id: str, user_id: str) -> None:
        collection_entity = collection_repository.find_one_unscoped(collection_id)
        ensure_collection_exists(collection_entity)

        deleted = collection_share_repository.delete(collection_id, user_id)
        if not deleted:
            raise CollectionShareNotFound()


collection_share_service = CollectionShareService()
