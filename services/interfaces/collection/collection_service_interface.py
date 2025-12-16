from dtos.collection_dto import CollectionDTO, CollectionCreateDTO, CollectionUpdateDTO
from repositorys.collection_repository import CollectionSearchParams
from typing import List, Optional, Protocol, Tuple


class CollectionServiceInterface(Protocol) :
    def find_many(self, params : Optional[CollectionSearchParams] = None) -> Tuple[List[CollectionDTO], int] :
        """Protocol method - implemented by concrete service"""
        ...

    def find_one(self, collection_id : str) -> CollectionDTO :
        """Protocol method - implemented by concrete service"""
        ...

    def create(self, collection_create_dto : CollectionCreateDTO) -> CollectionDTO :
        """Protocol method - implemented by concrete service"""
        ...

    def update(self, collection_id : str, collection_update_dto : CollectionUpdateDTO) -> CollectionDTO :
        """Protocol method - implemented by concrete service"""
        ...

    def delete(self, collection_id : str) -> None :
        """Protocol method - implemented by concrete service"""
        ...
