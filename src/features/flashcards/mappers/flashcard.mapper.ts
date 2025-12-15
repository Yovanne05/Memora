import type {
  FlashcardDto,
  FlashcardAnswerDto,
  FlashcardCreateDto,
  FlashcardUpdateDto,
  FlashcardDuplicateDto,
  FlashcardsListDto,
} from "../dtos/flashcard.dto";
import type {
  Flashcard,
  FlashcardAnswer,
  FlashcardCreate,
  FlashcardUpdate,
  FlashcardDuplicate,
} from "../models/flashcard.model";
import type { PaginatedFlashcards } from "../types/paginated-flashcard";

export function dtoToFlashcardAnswer(dto: FlashcardAnswerDto): FlashcardAnswer {
  return {
    id: dto.id,
    flashcardId: dto.flashcard_id,
    answerText: dto.answer_text,
    isCorrect: dto.is_correct,
    createdAt: new Date(dto.created_at),
  };
}

export function flashcardAnswerCreateToDto(
  answer: { answerText: string; isCorrect: boolean }
) {
  return {
    answer_text: answer.answerText,
    is_correct: answer.isCorrect,
  };
}

export function dtoToFlashcard(dto: FlashcardDto): Flashcard {
  return {
    id: dto.id,
    noteId: dto.note_id,
    question: dto.question,
    answers: dto.answers.map(dtoToFlashcardAnswer),
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
  };
}

export function toFlashcardCreateDto(
  flashcard: FlashcardCreate
): FlashcardCreateDto {
  return {
    question: flashcard.question,
    answers: flashcard.answers.map(flashcardAnswerCreateToDto),
  };
}

export function toFlashcardUpdateDto(
  flashcard: FlashcardUpdate
): FlashcardUpdateDto {
  const dto: FlashcardUpdateDto = {};

  if (flashcard.question !== undefined) {
    dto.question = flashcard.question;
  }

  if (flashcard.answers !== undefined) {
    dto.answers = flashcard.answers.map(flashcardAnswerCreateToDto);
  }

  return dto;
}

export function toFlashcardDuplicateDto(
  duplicate: FlashcardDuplicate
): FlashcardDuplicateDto {
  const dto: FlashcardDuplicateDto = {};

  if (duplicate.targetNoteId !== undefined) {
    dto.target_note_id = duplicate.targetNoteId;
  }

  return dto;
}

export function dtoToPaginatedFlashcards(
  dto: FlashcardsListDto
): PaginatedFlashcards {
  return {
    items: dto.items.map(dtoToFlashcard),
    total: dto.total,
    limit: dto.limit,
    offset: dto.offset,
  };
}
