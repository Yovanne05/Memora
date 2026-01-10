from typing import List, Protocol

from dtos.note_link_dto import NoteLinkCreateDTO, NoteLinkDTO, NoteLinkUpdateDTO


class NoteLinkServiceInterface(Protocol):
    def find_many(self) -> List[NoteLinkDTO]:
        ...

    def create_link(
        self, note_id: str, payload: NoteLinkCreateDTO
    ) -> NoteLinkDTO:
        ...

    def delete_link(self, note_id: str, linked_note_id: str) -> None:
        ...
        
    def update_link_label(self, note_id : str, linked_note_id : str, payload : NoteLinkUpdateDTO) -> NoteLinkDTO :
        ...