from typing import List, Protocol

from dtos.flashcard_dto import (
    FlashcardCreateDTO,
    FlashcardDTO,
    FlashcardUpdateDTO,
)


class FlashcardServiceInterface(Protocol):
    def find_many(self) -> List[FlashcardDTO]:
        pass

    def find_one(self, flashcard_id: str) -> FlashcardDTO:
        pass

    def create(self, note_id: str, payload: FlashcardCreateDTO) -> FlashcardDTO:
        pass

    def update(
        self, flashcard_id: str, payload: FlashcardUpdateDTO
    ) -> FlashcardDTO:
        pass

    def delete(self, flashcard_id: str) -> None:
        pass

    def duplicate(self, flashcard_id: str) -> FlashcardDTO:
        pass
