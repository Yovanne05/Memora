import type { PaginationParams } from "@/types/pagination"

export type FlashcardSortBy = "question" | "created_at" | "updated_at";
export type FlashcardSortDir = "asc" | "desc";

export interface FlashcardsFilters extends PaginationParams {
  noteId?: string;
  questionContains?: string;
  sortBy?: FlashcardSortBy;
  sortDir?: FlashcardSortDir;
}
