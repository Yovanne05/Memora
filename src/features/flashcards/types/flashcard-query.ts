export type FlashcardSortBy = "question" | "created_at" | "updated_at";
export type FlashcardSortDir = "asc" | "desc";

export interface FlashcardsFilters {
  noteId?: string;
  questionContains?: string;
  sortBy?: FlashcardSortBy;
  sortDir?: FlashcardSortDir;
}

export interface FlashcardsQuery extends FlashcardsFilters {
  limit?: number;
  offset?: number;
}
