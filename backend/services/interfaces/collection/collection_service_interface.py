from typing import List, Optional, Protocol, Tuple

from dtos.collection_dto import (
    CollectionCreateDTO,
    CollectionDTO,
    CollectionUpdateDTO,
)
from repositorys.collection_repository import CollectionSearchParams


class CollectionServiceInterface(Protocol):
    def find_many(
        self, params: Optional[CollectionSearchParams] = None
    ) -> Tuple[List[CollectionDTO], int]:
        ...

    def find_one(self, collection_id: str) -> CollectionDTO:
        ...

    def create(self, collection_create_dto: CollectionCreateDTO) -> CollectionDTO:
        ...

    def update(
        self,
        collection_id: str,
        collection_update_dto: CollectionUpdateDTO,
    ) -> CollectionDTO:
        ...

    def delete(self, collection_id: str) -> None:
        ...
