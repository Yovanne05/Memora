from typing import List, Protocol

from dtos.flashcard_dto import (
    FlashcardCreateDTO,
    FlashcardDTO,
    FlashcardUpdateDTO,
)


class FlashcardServiceInterface(Protocol):
    def find_many(self) -> List[FlashcardDTO]:
        """Protocol method - implemented by concrete service"""
        ...

    def find_one(self, flashcard_id: str) -> FlashcardDTO:
        """Protocol method - implemented by concrete service"""
        ...

    def create(self, note_id: str, payload: FlashcardCreateDTO) -> FlashcardDTO:
        """Protocol method - implemented by concrete service"""
        ...

    def update(
        self, flashcard_id: str, payload: FlashcardUpdateDTO
    ) -> FlashcardDTO:
        """Protocol method - implemented by concrete service"""
        ...

    def delete(self, flashcard_id: str) -> None:
        """Protocol method - implemented by concrete service"""
        ...

    def duplicate(self, flashcard_id: str) -> FlashcardDTO:
        """Protocol method - implemented by concrete service"""
        ...
