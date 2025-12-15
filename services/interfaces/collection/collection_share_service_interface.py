from typing import List, Protocol

from dtos.collection_share_dto import (
    CollectionShareCreateDTO,
    CollectionShareDTO,
    CollectionShareUpdateDTO,
)


class CollectionShareServiceInterface(Protocol):
    def share_collection(
        self, collection_id: str, share_dto: CollectionShareCreateDTO
    ) -> CollectionShareDTO:
        pass

    def update_share(
        self, collection_id: str, user_id: str, share_update_dto: CollectionShareUpdateDTO
    ) -> CollectionShareDTO:
        pass

    def revoke_share(self, collection_id: str, user_id: str) -> None:
        pass
