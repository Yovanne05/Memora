from typing import List, Tuple

from domain_services.flashcard_domain_service import apply_flashcard_update
from domain_services.permission_domain_service import permission_domain_service
from dtos.flashcard_dto import (
    FlashcardCreateDTO,
    FlashcardDTO,
    FlashcardUpdateDTO,
)
from dtos.flashcard_answer_dto import FlashcardAnswerCreateDTO
from exceptions.flashcard_exception import (
    FlashcardMustHaveAnswers,
    FlashcardMustHaveAtLeastOneCorrectAnswer,
    FlashcardNotFound,
)
from exceptions.note_exception import NoteNotFound
from mappers.flashcard_mapper import dto_to_flashcard, flashcard_to_dto
from repositorys import flashcard_repository, note_repository
from repositorys.flashcard_repository import FlashcardSearchParams
from services.interfaces.note.flashcard_service_interface import (
    FlashcardServiceInterface,
)
from utils.auth import get_current_user


class FlashcardService(FlashcardServiceInterface):
    def find_many(
        self, params: FlashcardSearchParams
    ) -> Tuple[List[FlashcardDTO], int]:
        user = get_current_user()
        flashcards, total = flashcard_repository.list_for_user(user, params)
        return [flashcard_to_dto(fc) for fc in flashcards], total

    def find_one(self, flashcard_id: str) -> FlashcardDTO:
        user = get_current_user()
        flashcard = flashcard_repository.get_for_user(user, flashcard_id)
        if not flashcard:
            raise FlashcardNotFound()
        return flashcard_to_dto(flashcard)

    def create(self, note_id: str, payload: FlashcardCreateDTO) -> FlashcardDTO:
        user = get_current_user()

        note = note_repository.find_one_unscoped(note_id)
        if not note:
            raise NoteNotFound()

        self._ensure_can_write_note(note_id, user)
        self._validate_answers(payload.answers)

        flashcard_entity = dto_to_flashcard(payload, note_id)
        saved = flashcard_repository.add(flashcard_entity)
        return flashcard_to_dto(saved)

    def update(
        self, flashcard_id: str, payload: FlashcardUpdateDTO
    ) -> FlashcardDTO:
        user = get_current_user()

        flashcard = flashcard_repository.find_one_unscoped(flashcard_id)
        if not flashcard:
            raise FlashcardNotFound()

        self._ensure_can_write_note(flashcard.note_id, user, FlashcardNotFound)

        if payload.answers is not None:
            self._validate_answers(payload.answers)

        updated_flashcard = apply_flashcard_update(flashcard, payload)
        saved = flashcard_repository.update(updated_flashcard)
        return flashcard_to_dto(saved)

    def delete(self, flashcard_id: str) -> None:
        user = get_current_user()

        flashcard = flashcard_repository.find_one_unscoped(flashcard_id)
        if not flashcard:
            raise FlashcardNotFound()

        self._ensure_can_write_note(flashcard.note_id, user)

        flashcard_repository.delete(flashcard_id)

    def duplicate(self, flashcard_id: str) -> FlashcardDTO:
        user = get_current_user()

        source_flashcard = flashcard_repository.find_one_unscoped(flashcard_id)
        if not source_flashcard:
            raise FlashcardNotFound()

        self._ensure_can_write_note(source_flashcard.note_id, user)

        create_dto = FlashcardCreateDTO(
            question=source_flashcard.question,
            answers=[
                FlashcardAnswerCreateDTO(
                    answer_text=answer.answer_text, is_correct=answer.is_correct
                )
                for answer in source_flashcard.answers
            ],
        )

        return self.create(source_flashcard.note_id, create_dto)

    def _ensure_can_write_note(self, note_id: str, user, exc=NoteNotFound) -> None:
        if not permission_domain_service.can_write_note(
            note_id, user.id, user.role
        ):
            raise exc()

    @staticmethod
    def _validate_answers(answers: list[FlashcardAnswerCreateDTO]) -> None:
        if not answers:
            raise FlashcardMustHaveAnswers()

        correct_answers_count = sum(1 for answer in answers if answer.is_correct)
        if correct_answers_count < 1:
            raise FlashcardMustHaveAtLeastOneCorrectAnswer()


flashcard_service = FlashcardService()
