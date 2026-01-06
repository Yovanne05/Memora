from typing import List, Protocol, Tuple

from dtos.note_share_link_dto import NoteShareLinkCreateDTO, NoteShareLinkDTO
from repositorys.note_share_link_repository import NoteShareLinkSearchParams


class NoteShareLinkServiceInterface(Protocol):
    def find_many(
        self, params: NoteShareLinkSearchParams
    ) -> Tuple[List[NoteShareLinkDTO], int]:
        ...

    def create_share_link(
        self, note_id: str, share_link_dto: NoteShareLinkCreateDTO
    ) -> NoteShareLinkDTO:
        ...

    def delete_share_link(self, note_id: str, link_id: str) -> None:
        ...
