from __future__ import annotations

from abc import ABC, abstractmethod
from typing import List, Tuple

from dtos.collection_favorite_dto import CollectionFavoriteDTO
from repositorys.collection_favorite_repository import (
    CollectionFavoriteSearchParams,
)


class CollectionFavoriteServiceInterface(ABC):
    @abstractmethod
    def find_many(self, params: CollectionFavoriteSearchParams) -> Tuple[List[CollectionFavoriteDTO], int]:
        raise NotImplementedError

    @abstractmethod
    def add_favorite(self, collection_id: str) -> CollectionFavoriteDTO:
        raise NotImplementedError

    @abstractmethod
    def remove_favorite(self, collection_id: str) -> None:
        raise NotImplementedError
