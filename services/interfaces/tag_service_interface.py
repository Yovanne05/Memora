from typing import List, Optional, Protocol, Tuple

from dtos.tag_dto import TagCreateDTO, TagDTO, TagUpdateDTO
from repositorys.tag_repository import TagSearchParams


class TagServiceInterface(Protocol):
    def find_many(
        self, params: Optional[TagSearchParams] = None
    ) -> Tuple[List[TagDTO], int]:
        pass

    def find_one(self, tag_id: str) -> TagDTO:
        pass

    def create(self, tag_create_dto: TagCreateDTO) -> TagDTO:
        pass

    def update(self, tag_id: str, tag_update_dto: TagUpdateDTO) -> TagDTO:
        pass

    def delete(self, tag_id: str) -> None:
        pass
