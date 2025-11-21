from typing import List, Protocol

from dtos.tag_assignment_dto import TagAssignmentDTO
from dtos.tag_dto import TagDTO


class CollectionTagServiceInterface(Protocol):
    def list_tags(self, collection_id: str) -> List[TagDTO]:
        pass

    def replace_tags(
        self, collection_id: str, payload: TagAssignmentDTO
    ) -> List[TagDTO]:
        pass
