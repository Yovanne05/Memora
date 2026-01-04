from typing import List, Tuple

from daos.favorite_dao import CollectionFavorite
from domain_services.collection_domain_service import ensure_collection_exists
from dtos.collection_favorite_dto import CollectionFavoriteDTO
from exceptions.favorite_exception import FavoriteNotFound
from mappers.collection_favorite_mapper import collection_favorite_to_dto
from repositorys import collection_favorite_repository, collection_repository
from repositorys.collection_favorite_repository import (
    CollectionFavoriteSearchParams,
)
from services.interfaces.favorite.collection_favorite_service_interface import (
    CollectionFavoriteServiceInterface,
)
from utils.access_scope import accessible_collection_ids
from utils.auth import get_current_user


class CollectionFavoriteService(CollectionFavoriteServiceInterface):
    def find_many(
        self, params: CollectionFavoriteSearchParams
    ) -> Tuple[List[CollectionFavoriteDTO], int]:
        user = get_current_user()
        favorites, total = collection_favorite_repository.find_many(
            user.id, params
        )
        allowed = accessible_collection_ids(user)
        if allowed is not None:
            if not allowed:
                return [], 0
            favorites = [fav for fav in favorites if fav.collection_id in allowed]
            total = len(favorites)
        return [collection_favorite_to_dto(fav) for fav in favorites], total

    def add_favorite(self, collection_id: str) -> CollectionFavoriteDTO:
        user = get_current_user()
        collection_entity = collection_repository.get_for_user(
            user, collection_id
        )
        ensure_collection_exists(collection_entity)

        existing = collection_favorite_repository.find_one(user.id, collection_id)
        if existing:
            return collection_favorite_to_dto(existing)

        favorite = CollectionFavorite(
            user_id=user.id, collection_id=collection_id
        )
        saved = collection_favorite_repository.add(favorite)
        return collection_favorite_to_dto(saved)

    def remove_favorite(self, collection_id: str) -> None:
        user = get_current_user()
        collection_entity = collection_repository.get_for_user(
            user, collection_id
        )
        ensure_collection_exists(collection_entity)

        deleted = collection_favorite_repository.delete(user.id, collection_id)
        if not deleted:
            raise FavoriteNotFound()


collection_favorite_service = CollectionFavoriteService()
