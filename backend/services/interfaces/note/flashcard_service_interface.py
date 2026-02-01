from typing import List, Protocol

from dtos.flashcard_dto import (
    FlashcardCreateDTO,
    FlashcardDTO,
    FlashcardUpdateDTO,
)


class FlashcardServiceInterface(Protocol):
    def find_many(self) -> List[FlashcardDTO]:
        ...

    def find_one(self, flashcard_id: str) -> FlashcardDTO:
        ...

    def create(self, note_id: str, payload: FlashcardCreateDTO) -> FlashcardDTO:
        ...

    def update(
        self, flashcard_id: str, payload: FlashcardUpdateDTO
    ) -> FlashcardDTO:
        ...

    def delete(self, flashcard_id: str) -> None:
        ...

    def duplicate(self, flashcard_id: str) -> FlashcardDTO:
        ...
