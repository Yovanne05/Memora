from typing import List

from domain_services.flashcard_domain_service import apply_flashcard_update
from dtos.flashcard_dto import FlashcardCreateDTO, FlashcardDTO, FlashcardUpdateDTO
from exceptions.flashcard_exception import (
    FlashcardMustHaveAnswers,
    FlashcardMustHaveAtLeastOneCorrectAnswer,
    FlashcardNotFound,
)
from exceptions.note_exception import NoteNotFound
from mappers.flashcard_mapper import dto_to_flashcard, flashcard_to_dto
from repositorys import flashcard_repository, note_repository
from services.interfaces.note.flashcard_service_interface import (
    FlashcardServiceInterface,
)


class FlashcardService(FlashcardServiceInterface):
    def list_flashcards(self, note_id: str) -> List[FlashcardDTO]:
        note = note_repository.find_one(note_id)
        if not note:
            raise NoteNotFound()

        flashcards = flashcard_repository.find_by_note(note_id)
        return [flashcard_to_dto(fc) for fc in flashcards]

    def find_one(self, flashcard_id: str) -> FlashcardDTO:
        flashcard = flashcard_repository.find_one(flashcard_id)
        if not flashcard:
            raise FlashcardNotFound()
        return flashcard_to_dto(flashcard)

    def create(self, note_id: str, payload: FlashcardCreateDTO) -> FlashcardDTO:
        note = note_repository.find_one(note_id)
        if not note:
            raise NoteNotFound()

        if not payload.answers or len(payload.answers) == 0:
            raise FlashcardMustHaveAnswers()

        correct_answers_count = sum(1 for a in payload.answers if a.is_correct)
        if correct_answers_count < 1:
            raise FlashcardMustHaveAtLeastOneCorrectAnswer()

        flashcard_entity = dto_to_flashcard(payload, note_id)
        saved = flashcard_repository.add(flashcard_entity)
        return flashcard_to_dto(saved)

    def update(
        self, flashcard_id: str, payload: FlashcardUpdateDTO
    ) -> FlashcardDTO:
        flashcard = flashcard_repository.find_one(flashcard_id)
        if not flashcard:
            raise FlashcardNotFound()

        if payload.answers is not None:
            if len(payload.answers) == 0:
                raise FlashcardMustHaveAnswers()

            correct_answers_count = sum(1 for a in payload.answers if a.is_correct)
            if correct_answers_count < 1:
                raise FlashcardMustHaveAtLeastOneCorrectAnswer()

        updated_flashcard = apply_flashcard_update(flashcard, payload)
        saved = flashcard_repository.update(updated_flashcard)
        return flashcard_to_dto(saved)

    def delete(self, flashcard_id: str) -> None:
        deleted = flashcard_repository.delete(flashcard_id)
        if not deleted:
            raise FlashcardNotFound()


flashcard_service = FlashcardService()
