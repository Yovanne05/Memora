from typing import List, Protocol

from dtos.tag_assignment_dto import TagAssignmentDTO
from dtos.tag_dto import TagDTO


class NoteTagServiceInterface(Protocol):
    def list_tags(self, note_id: str) -> List[TagDTO]:
        pass

    def replace_tags(self, note_id: str, payload: TagAssignmentDTO) -> List[TagDTO]:
        pass
