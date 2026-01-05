from typing import List, Tuple

from domain_services.collection_domain_service import ensure_collection_exists
from dtos.collection_share_link_dto import CollectionShareLinkCreateDTO, CollectionShareLinkDTO
from exceptions.collection_share_link_exception import CollectionShareLinkNotFound
from mappers.collection_share_link_mapper import dto_to_collection_share_link, collection_share_link_to_dto
from repositorys import collection_repository, collection_share_link_repository
from repositorys.collection_share_link_repository import CollectionShareLinkSearchParams
from services.interfaces.collection.collection_share_link_service_interface import (
    CollectionShareLinkServiceInterface,
)
from utils.auth import get_current_user


class CollectionShareLinkService(CollectionShareLinkServiceInterface):
    def find_many(self, params: CollectionShareLinkSearchParams) -> Tuple[List[CollectionShareLinkDTO], int]:
        user = get_current_user()
        share_links, total = collection_share_link_repository.find_many(params)
        
        # Filter to only include links for collections owned by current user
        filtered_links = [
            link for link in share_links 
            if self._user_owns_collection(user.id, link.collection_id)
        ]
        
        return [collection_share_link_to_dto(link) for link in filtered_links], len(filtered_links)

    def _user_owns_collection(self, user_id: str, collection_id: str) -> bool:
        collection = collection_repository.find_one_unscoped(collection_id)
        return collection is not None and collection.owner_id == user_id

    def create_share_link(
        self, collection_id: str, share_link_dto: CollectionShareLinkCreateDTO
    ) -> CollectionShareLinkDTO:
        collection_entity = collection_repository.find_one_unscoped(collection_id)
        ensure_collection_exists(collection_entity)

        share_link_entity = dto_to_collection_share_link(collection_id, share_link_dto)
        saved = collection_share_link_repository.add(share_link_entity)
        return collection_share_link_to_dto(saved)

    def delete_share_link(self, collection_id: str, link_id: str) -> None:
        collection_entity = collection_repository.find_one_unscoped(collection_id)
        ensure_collection_exists(collection_entity)

        deleted = collection_share_link_repository.delete(link_id)
        if not deleted:
            raise CollectionShareLinkNotFound()


collection_share_link_service = CollectionShareLinkService()
