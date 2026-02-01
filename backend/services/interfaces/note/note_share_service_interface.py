from typing import List, Protocol

from dtos.note_share_dto import (
    NoteShareCreateDTO,
    NoteShareDTO,
    NoteShareUpdateDTO,
)


class NoteShareServiceInterface(Protocol):
    def find_many(self) -> List[NoteShareDTO]:
        ...

    def share_note(
        self, note_id: str, share_dto: NoteShareCreateDTO
    ) -> NoteShareDTO:
        ...

    def update_share(
        self, note_id: str, user_id: str, share_update_dto: NoteShareUpdateDTO
    ) -> NoteShareDTO:
        ...

    def revoke_share(self, note_id: str, user_id: str) -> None:
        ...
