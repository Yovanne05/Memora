from __future__ import annotations

from abc import ABC, abstractmethod
from typing import List, Tuple

from dtos.note_favorite_dto import NoteFavoriteDTO
from repositorys.note_favorite_repository import NoteFavoriteSearchParams


class NoteFavoriteServiceInterface(ABC):
    @abstractmethod
    def find_many(self, params: NoteFavoriteSearchParams) -> Tuple[List[NoteFavoriteDTO], int]:
        raise NotImplementedError

    @abstractmethod
    def add_favorite(self, note_id: str) -> NoteFavoriteDTO:
        raise NotImplementedError

    @abstractmethod
    def remove_favorite(self, note_id: str) -> None:
        raise NotImplementedError
