from typing import List, Protocol

from dtos.flashcard_dto import (
    FlashcardCreateDTO,
    FlashcardDTO,
    FlashcardDuplicateDTO,
    FlashcardUpdateDTO,
)


class FlashcardServiceInterface(Protocol):
    def list_flashcards(self, note_id: str) -> List[FlashcardDTO]:
        pass

    def find_one(self, flashcard_id: str) -> FlashcardDTO:
        pass

    def create(self, note_id: str, payload: FlashcardCreateDTO) -> FlashcardDTO:
        pass

    def update(
        self, flashcard_id: str, payload: FlashcardUpdateDTO
    ) -> FlashcardDTO:
        pass

    def duplicate(
        self, flashcard_id: str, payload: FlashcardDuplicateDTO
    ) -> FlashcardDTO:
        pass

    def delete(self, flashcard_id: str) -> None:
        pass
