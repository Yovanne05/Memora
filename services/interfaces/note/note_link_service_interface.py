from typing import List, Protocol

from dtos.note_link_dto import NoteLinkCreateDTO, NoteLinkDTO


class NoteLinkServiceInterface(Protocol):
    def list_links(self, note_id: str) -> List[NoteLinkDTO]:
        pass

    def create_link(
        self, note_id: str, payload: NoteLinkCreateDTO
    ) -> NoteLinkDTO:
        pass

    def delete_link(self, note_id: str, linked_note_id: str) -> None:
        pass
