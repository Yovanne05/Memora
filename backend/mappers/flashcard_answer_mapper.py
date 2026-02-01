from daos.flashcard_answer_dao import FlashcardAnswer
from dtos.flashcard_answer_dto import FlashcardAnswerCreateDTO, FlashcardAnswerDTO


def flashcard_answer_to_dto(answer_entity: FlashcardAnswer) -> FlashcardAnswerDTO:
    return FlashcardAnswerDTO.model_validate(answer_entity)


def dto_to_flashcard_answer(
    answer_dto: FlashcardAnswerCreateDTO, flashcard_id: str
) -> FlashcardAnswer:
    return FlashcardAnswer(
        flashcard_id=flashcard_id,
        answer_text=answer_dto.answer_text,
        is_correct=answer_dto.is_correct,
    )
