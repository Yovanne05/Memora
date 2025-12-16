from typing import List, Optional, Protocol, Tuple

from dtos.note_dto import NoteCreateDTO, NoteDTO, NoteUpdateDTO
from repositorys.note_repository import NoteSearchParams


class NoteCrudServiceInterface(Protocol):
    def find_many(
        self, params: Optional[NoteSearchParams] = None
    ) -> Tuple[List[NoteDTO], int]:
        """Protocol method - implemented by concrete service"""
        ...

    def find_one(self, note_id: str) -> NoteDTO:
        """Protocol method - implemented by concrete service"""
        ...

    def create(self, note_create_dto: NoteCreateDTO) -> NoteDTO:
        """Protocol method - implemented by concrete service"""
        ...

    def update(self, note_id: str, note_update_dto: NoteUpdateDTO) -> NoteDTO:
        """Protocol method - implemented by concrete service"""
        ...

    def delete(self, note_id: str) -> None:
        """Protocol method - implemented by concrete service"""
        ...
