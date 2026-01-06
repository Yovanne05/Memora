from typing import List, Tuple

from domain_services.collection_domain_service import (
    ensure_collection_exists,
    ensure_not_sharing_with_owner,
    ensure_share_does_not_exist,
    ensure_user_exists,
)
from domain_services.permission_domain_service import permission_domain_service
from dtos.collection_share_dto import (
    CollectionShareCreateDTO,
    CollectionShareDTO,
    CollectionShareUpdateDTO,
)
from exceptions.share_collection_exception import (
    CollectionShareNotFound,
    CollectionSharePermissionDenied,
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
from repositorys.collection_share_repository import CollectionShareSearchParams
from services.interfaces.collection.collection_share_service_interface import (
    CollectionShareServiceInterface,
)
from utils.auth import get_current_user


class CollectionShareService(CollectionShareServiceInterface):
    def find_many(
        self, params: CollectionShareSearchParams
    ) -> Tuple[List[CollectionShareDTO], int]:
        shares, total = collection_share_repository.find_many(params)
        return [collection_share_to_dto(share) for share in shares], total

    def share_collection(
        self, collection_id: str, share_dto: CollectionShareCreateDTO
    ) -> CollectionShareDTO:
        current_user = get_current_user()

        collection_entity = collection_repository.find_one_unscoped(collection_id)
        ensure_collection_exists(collection_entity)

        self._ensure_can_manage_collection(collection_id, current_user)

        user_entity = user_repository.find_one(share_dto.user_id)
        ensure_user_exists(user_entity)

        ensure_not_sharing_with_owner(
            collection_entity.owner_id, share_dto.user_id
        )

        existing_share = collection_share_repository.find_one(
            collection_id, share_dto.user_id
        )
        ensure_share_does_not_exist(existing_share)

        share_entity = dto_to_collection_share(collection_id, share_dto)
        saved = collection_share_repository.add(share_entity)
        return collection_share_to_dto(saved)

    def update_share(
        self,
        collection_id: str,
        user_id: str,
        share_update_dto: CollectionShareUpdateDTO,
    ) -> CollectionShareDTO:
        current_user = get_current_user()

        collection_entity = collection_repository.find_one_unscoped(collection_id)
        ensure_collection_exists(collection_entity)

        self._ensure_can_manage_collection(collection_id, current_user)

        share_entity = collection_share_repository.find_one(
            collection_id, user_id
        )
        if not share_entity:
            raise CollectionShareNotFound()

        share_entity.permission = share_update_dto.permission
        saved = collection_share_repository.update(share_entity)
        return collection_share_to_dto(saved)

    def revoke_share(self, collection_id: str, user_id: str) -> None:
        current_user = get_current_user()

        collection_entity = collection_repository.find_one_unscoped(collection_id)
        ensure_collection_exists(collection_entity)

        self._ensure_can_manage_collection(collection_id, current_user)

        deleted = collection_share_repository.delete(collection_id, user_id)
        if not deleted:
            raise CollectionShareNotFound()

    def _ensure_can_manage_collection(self, collection_id: str, user) -> None:
        if not permission_domain_service.can_manage_collection(
            collection_id, user.id, user.role
        ):
            raise CollectionSharePermissionDenied()


collection_share_service = CollectionShareService()
