from typing import List, Tuple

from daos.favorite_dao import NoteFavorite
from domain_services.note_domain_service import ensure_note_exists
from dtos.note_favorite_dto import NoteFavoriteDTO
from exceptions.favorite_exception import FavoriteNotFound
from mappers.note_favorite_mapper import note_favorite_to_dto
from repositorys import note_favorite_repository, note_repository
from repositorys.note_favorite_repository import NoteFavoriteSearchParams
from services.interfaces.favorite.note_favorite_service_interface import (
    NoteFavoriteServiceInterface,
)
from utils.access_scope import accessible_note_ids
from utils.auth import get_current_user


class NoteFavoriteService(NoteFavoriteServiceInterface):
    def find_many(
        self, params: NoteFavoriteSearchParams
    ) -> Tuple[List[NoteFavoriteDTO], int]:
        user = get_current_user()
        favorites, total = note_favorite_repository.find_many(user.id, params)
        allowed = accessible_note_ids(user)
        if allowed is not None:
            if not allowed:
                return [], 0
            favorites = [fav for fav in favorites if fav.note_id in allowed]
            total = len(favorites)
        return [note_favorite_to_dto(fav) for fav in favorites], total

    def add_favorite(self, note_id: str) -> NoteFavoriteDTO:
        user = get_current_user()
        note_entity = note_repository.get_for_user(user, note_id)
        ensure_note_exists(note_entity)

        existing = note_favorite_repository.find_one(user.id, note_id)
        if existing:
            return note_favorite_to_dto(existing)

        favorite = NoteFavorite(user_id=user.id, note_id=note_id)
        saved = note_favorite_repository.add(favorite)
        return note_favorite_to_dto(saved)

    def remove_favorite(self, note_id: str) -> None:
        user = get_current_user()
        note_entity = note_repository.get_for_user(user, note_id)
        ensure_note_exists(note_entity)

        deleted = note_favorite_repository.delete(user.id, note_id)
        if not deleted:
            raise FavoriteNotFound()


note_favorite_service = NoteFavoriteService()
