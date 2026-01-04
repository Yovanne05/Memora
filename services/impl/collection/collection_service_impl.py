from domain_services.collection_domain_service import (
    apply_collection_update,
    ensure_collection_exists,
)
from dtos.collection_dto import (CollectionCreateDTO, CollectionDTO, CollectionUpdateDTO)
from exceptions.collection_exception import (CollectionNotFound)
from mappers.collection_mapper import collection_to_dto, dto_to_collection
from repositorys.collection_repository import CollectionSearchParams
from services.interfaces.collection.collection_service_interface import (CollectionServiceInterface)
from typing import List, Optional, Tuple
from repositorys import collection_repository, note_favorite_repository
from repositorys import collection_favorite_repository
from utils.auth import get_current_user


class CollectionService(CollectionServiceInterface) :
    def find_many(self, params : Optional[CollectionSearchParams] = None) -> Tuple[List[CollectionDTO], int] :
        user = get_current_user()
        entities, total = collection_repository.list_for_user(user, params)
        collection_favorites = collection_favorite_repository.favorite_collection_ids_for_user(user.id)
        note_favorites = note_favorite_repository.favorite_note_ids_for_user(user.id)
        return [
            collection_to_dto(
                entity,
                collection_favorite_ids=collection_favorites,
                note_favorite_ids=note_favorites,
            )
            for entity in entities
        ], total

    def find_one(self, collection_id : str) -> CollectionDTO :
        user = get_current_user()
        collection_entity = collection_repository.get_for_user(user, collection_id)
        ensure_collection_exists(collection_entity)
        collection_favorites = collection_favorite_repository.favorite_collection_ids_for_user(user.id)
        note_favorites = note_favorite_repository.favorite_note_ids_for_user(user.id)
        return collection_to_dto(
            collection_entity,
            collection_favorite_ids=collection_favorites,
            note_favorite_ids=note_favorites,
        )

    def create(self, collection_create_dto : CollectionCreateDTO) -> CollectionDTO :
        entity = dto_to_collection(collection_create_dto)
        saved = collection_repository.add(entity)
        return collection_to_dto(saved)

    def update(self, collection_id : str, collection_update_dto : CollectionUpdateDTO) -> CollectionDTO :
        collection_entity = collection_repository.find_one_unscoped(collection_id)
        ensure_collection_exists(collection_entity)

        updated_entity = apply_collection_update(collection_entity, collection_update_dto)
        saved = collection_repository.update(updated_entity)
        return collection_to_dto(saved)

    def delete(self, collection_id : str) -> None :
        deleted = collection_repository.delete(collection_id)
        if not deleted :
            raise CollectionNotFound()


collection_service = CollectionService()
