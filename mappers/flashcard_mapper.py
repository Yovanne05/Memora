from daos.flashcard_dao import Flashcard
from dtos.flashcard_dto import FlashcardCreateDTO, FlashcardDTO
from mappers.flashcard_answer_mapper import flashcard_answer_to_dto


def flashcard_to_dto(flashcard_entity: Flashcard) -> FlashcardDTO:
    return FlashcardDTO(
        id=flashcard_entity.id,
        note_id=flashcard_entity.note_id,
        question=flashcard_entity.question,
        answers=[flashcard_answer_to_dto(a) for a in flashcard_entity.answers],
        created_at=flashcard_entity.created_at,
        updated_at=flashcard_entity.updated_at,
    )


def dto_to_flashcard(flashcard_dto: FlashcardCreateDTO, note_id: str) -> Flashcard:
    from daos.flashcard_answer_dao import FlashcardAnswer

    flashcard = Flashcard(
        note_id=note_id,
        question=flashcard_dto.question,
    )

    flashcard.answers = [
        FlashcardAnswer(
            answer_text=answer_dto.answer_text,
            is_correct=answer_dto.is_correct,
        )
        for answer_dto in flashcard_dto.answers
    ]
    return flashcard
