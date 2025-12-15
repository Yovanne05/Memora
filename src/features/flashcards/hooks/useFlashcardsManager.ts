import { useCallback, useMemo, useState } from "react";
import type { FlashcardsFilters } from "../types/flashcard-query";
import { useFlashcardsQuery } from "./useFlashcardsQuery";

export type FlashcardsView = "grid" | "list";
export type FlashcardsSort = "recent" | "oldest" | "question-asc" | "question-desc";

const SORT_MAP: Record<FlashcardsSort, Pick<FlashcardsFilters, "sortBy" | "sortDir">> = {
  recent: { sortBy: "created_at", sortDir: "desc" },
  oldest: { sortBy: "created_at", sortDir: "asc" },
  "question-asc": { sortBy: "question", sortDir: "asc" },
  "question-desc": { sortBy: "question", sortDir: "desc" },
};

export function useFlashcardsManager(initialLimit = 12, noteId?: string) {
  const [page, setPage] = useState(0);
  const [limit] = useState(initialLimit);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<FlashcardsSort>("recent");
  const [view, setView] = useState<FlashcardsView>("grid");

  const filters = useMemo<FlashcardsFilters>(() => {
    const sortConfig = SORT_MAP[sort];
    const question = search.trim();
    return {
      ...sortConfig,
      questionContains: question || undefined,
      noteId,
    };
  }, [search, sort, noteId]);

  const query = useFlashcardsQuery(page, limit, filters);

  const reset = useCallback(() => {
    setSearch("");
    setSort("recent");
    setPage(0);
  }, []);

  const total = query.data?.total ?? 0;
  const items = query.data?.items ?? [];
  const maxPage = Math.max(0, Math.ceil(total / limit) - 1);

  return {
    data: items,
    total,
    page,
    maxPage,
    view,
    filters,
    sort,
    search,

    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,

    setPage,
    setView,
    setSort,
    setSearch,
    reset,
  };
}
