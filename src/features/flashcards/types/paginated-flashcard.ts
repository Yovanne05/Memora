import type { Flashcard } from "../models/flashcard.model";

export interface PaginatedFlashcards {
  items: Flashcard[];
  total: number;
  limit?: number;
  offset?: number;
}
