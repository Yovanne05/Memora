from daos.flashcard_dao import Flashcard
from daos.flashcard_answer_dao import FlashcardAnswer
from dtos.flashcard_dto import FlashcardUpdateDTO


def apply_flashcard_update(
    flashcard_entity: Flashcard, flashcard_update_dto: FlashcardUpdateDTO
) -> Flashcard:
    if flashcard_update_dto.question is not None:
        flashcard_entity.question = flashcard_update_dto.question

    if flashcard_update_dto.difficulty is not None:
        flashcard_entity.difficulty = flashcard_update_dto.difficulty

    if flashcard_update_dto.answers is not None:
        flashcard_entity.answers.clear()
        flashcard_entity.answers = [
            FlashcardAnswer(
                answer_text=answer_dto.answer_text,
                is_correct=answer_dto.is_correct,
            )
            for answer_dto in flashcard_update_dto.answers
        ]

    return flashcard_entity
