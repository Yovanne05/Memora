from typing import List, Protocol, Tuple

from dtos.collection_share_link_dto import (
    CollectionShareLinkCreateDTO,
    CollectionShareLinkDTO,
)
from repositorys.collection_share_link_repository import CollectionShareLinkSearchParams


class CollectionShareLinkServiceInterface(Protocol):
    def find_many(
        self, params: CollectionShareLinkSearchParams
    ) -> Tuple[List[CollectionShareLinkDTO], int]:
        ...

    def create_share_link(
        self, collection_id: str, share_link_dto: CollectionShareLinkCreateDTO
    ) -> CollectionShareLinkDTO:
        ...

    def delete_share_link(self, collection_id: str, link_id: str) -> None:
        ...
