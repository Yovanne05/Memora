import { useMemo } from "react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useNoteSharesByUserQuery } from "@/features/notes/hooks/useNoteSharesByUserQuery"
import { useCollectionSharesByUserQuery } from "@/features/collections/hooks/useCollectionSharesByUserQuery"

export function useWorkspaceAccessScope() {
  const { user } = useAuth()
  const userId = user?.id ?? null

  const noteSharesQuery = useNoteSharesByUserQuery(userId ?? undefined)
  const collectionSharesQuery = useCollectionSharesByUserQuery(userId ?? undefined)

  const sharedNoteIds = useMemo(() => {
    return new Set(noteSharesQuery.data?.map((share) => share.noteId) ?? [])
  }, [noteSharesQuery.data])

  const sharedCollectionIds = useMemo(() => {
    return new Set(
      collectionSharesQuery.data?.map((share) => share.collectionId) ?? []
    )
  }, [collectionSharesQuery.data])

  return {
    userId,
    sharedNoteIds,
    sharedCollectionIds,
    isLoading: noteSharesQuery.isLoading || collectionSharesQuery.isLoading,
    isError: noteSharesQuery.isError || collectionSharesQuery.isError,
    error: noteSharesQuery.error ?? collectionSharesQuery.error,
  }
}
