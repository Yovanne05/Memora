import { useCallback, useMemo, useState } from "react"
import { useParams } from "@tanstack/react-router"

import { useAuth } from "@/features/auth/hooks/useAuth"
import { useNotesQuery } from "@/features/notes/hooks/useNotesQuery"
import { useUpdateNoteMutation } from "@/features/notes/hooks/useUpdateNoteMutation"
import type { Note } from "@/features/notes/models/note.model"
import type { AvailableNoteOption, NotesSort } from "../types/note.types"

export function useCollectionNotesSection() {
  const { collectionId } = useParams({
    from: "/app/workspace/collections/$collectionId/",
  })
  const { user } = useAuth()
  const userId = user?.id

  const { data, isLoading } = useNotesQuery(0, 20, {
    collectionId: collectionId,
  })
  const { data: allNotes } = useNotesQuery(0, 100, {})

  const availableNotes: AvailableNoteOption[] = useMemo(() => {
    const notes: Note[] = allNotes?.items ?? []
    const filtered = notes.filter(
      (note) => note.ownerId === userId && !note.collectionId
    )
    return filtered.map((note) => ({ id: note.id, title: note.title }))
  }, [allNotes, userId])

  const updateNoteMutation = useUpdateNoteMutation()
  const { mutateAsync, isPending } = updateNoteMutation

  const [selected, setSelected] = useState("")
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<NotesSort>("recent")

  const handleAddExisting = useCallback(
    async (noteId?: string) => {
      if (!noteId) return
      try {
        await mutateAsync({ noteId, payload: { collectionId } })
      } catch (err) {
        console.error("Failed to add note to collection", err)
      }
    },
    [collectionId, mutateAsync]
  )

  const handleRemoveFromCollection = useCallback(
    async (noteId: string) => {
      try {
        await mutateAsync({ noteId, payload: { collectionId: null } })
      } catch (err) {
        console.error("Failed to remove note from collection", err)
      }
    },
    [mutateAsync]
  )

  const handleSelectNote = useCallback(
    (value: string) => {
      setSelected(value)
      handleAddExisting(value)
      setSelected("")
    },
    [handleAddExisting]
  )

  const filteredNotes = useMemo(() => {
    const notes: Note[] = data?.items ?? []
    let filtered = notes

    if (search.trim()) {
      const query = search.toLowerCase()
      filtered = notes.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          (note.content ?? "").toLowerCase().includes(query)
      )
    }

    return [...filtered].sort((a, b) => {
      if (sort === "alphabetical") {
        return a.title.localeCompare(b.title)
      }
      if (sort === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [data, search, sort])

  return {
    availableNotes,
    selected,
    isLoading,
    isUpdating: isPending,
    onSelectNote: handleSelectNote,
    search,
    setSearch,
    sort,
    setSort,
    notes: filteredNotes,
    onRemoveFromCollection: handleRemoveFromCollection,
  }
}


