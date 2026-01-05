import { useQuery } from "@tanstack/react-query"
import { collectionsService } from "@/features/collections/services/collections.service"
import { COLLECTIONS_QUERY_KEYS } from "./collections.keys"

type CollectionsListParams = {
  ownerId?: string
  sharedWithUserId?: string
  visibility?: "private" | "public"
  titleContains?: string
  tags?: string
  ids?: string
  onlyWithNotes?: boolean
  isFavorite?: boolean
  sortBy?: "title" | "created_at" | "updated_at"
  sortDir?: "asc" | "desc"
  limit?: number
  offset?: number
}

export function useCollectionsListQuery(params: CollectionsListParams = {}) {
  return useQuery({
    queryKey: [...COLLECTIONS_QUERY_KEYS.list(), params],
    queryFn: () => collectionsService.list(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}
