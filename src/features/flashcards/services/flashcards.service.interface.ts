import type { Flashcard, FlashcardCreate, FlashcardUpdate, FlashcardDuplicate } from "../models/flashcard.model";
import type { PaginatedFlashcards } from "../types/paginated-flashcard";
import type { FlashcardsFilters } from "../types/flashcard-query";

export interface IFlashcardsService {
  list(query?: FlashcardsFilters): Promise<PaginatedFlashcards>;
  getById(id: string): Promise<Flashcard>;
  create(flashcard: FlashcardCreate): Promise<Flashcard>;
  update(id: string, flashcard: FlashcardUpdate): Promise<Flashcard>;
  delete(id: string): Promise<void>;
  duplicate(id: string, payload?: FlashcardDuplicate): Promise<Flashcard>;
}
