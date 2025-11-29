import { useMemo, useCallback, useState } from "react"
import { useParams } from "@tanstack/react-router"
import { useNotesQuery } from "@/features/notes/hooks/useNotesQuery"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { CollectionNotesHeader } from "./CollectionNotesHeader"
import { useUpdateNoteMutation } from "@/features/notes/hooks/useUpdateNoteMutation"
import type { Note } from "@/features/notes/models/note.model"
import { CollectionNotesGrid } from "./CollectionNotesGrid"
import type { AvailableNoteOption } from "../../types/note.types"

export function CollectionNotesSection() {
  const { id } = useParams({ from: "/app/collections/$id/" })
  const { userId } = useCurrentUser()

  // Notes dans la collection
  const { data, isLoading } = useNotesQuery(0, 20, { collectionId: id })

  // Notes dispo à ajouter
  const { data: allData } = useNotesQuery(0, 100, {})

  const availableNotes: AvailableNoteOption[] = useMemo(() => {
    const allNotes = (allData?.items ?? []) as Note[]

    return allNotes
      .filter((n) => n.ownerId === userId && !n.collectionId)
      .map((n) => ({ id: n.id, title: n.title }))
  }, [allData, userId])

  const updateNoteMutation = useUpdateNoteMutation()
  const { mutateAsync, isPending } = updateNoteMutation

  const [selected, setSelected] = useState("")
  const [search, setSearch] = useState("")

  const handleAddExisting = useCallback(
    async (noteId?: string) => {
      if (!noteId) return
      try {
        await mutateAsync({ noteId, payload: { collection_id: id } })
      } catch (err) {
        console.error("Failed to add note to collection", err)
      }
    },
    [id, mutateAsync]
  )

  const handleRemoveFromCollection = useCallback(
    async (noteId: string) => {
      try {
        await mutateAsync({ noteId, payload: { collection_id: null } })
      } catch (err) {
        console.error("Failed to remove note from collection", err)
      }
    },
    [mutateAsync]
  )

  const handleSelectNote = useCallback(
    (val: string) => {
      setSelected(val)
      handleAddExisting(val)
      setSelected("")
    },
    [handleAddExisting]
  )

  const filteredNotes = useMemo(() => {
    const notes = (data?.items ?? []) as Note[]

    if (!search.trim()) return notes
    const q = search.toLowerCase()

    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        (n.content ?? "").toLowerCase().includes(q)
    )
  }, [data, search])

  return (
    <div className="space-y-4">
      <CollectionNotesHeader
        availableNotes={availableNotes}
        selected={selected}
        isAdding={isPending}
        onSelectNote={handleSelectNote}
        searchValue={search}
        onSearchChange={setSearch}
      />

      <CollectionNotesGrid
        notes={filteredNotes}
        isLoading={isLoading}
        isUpdating={isPending}
        onRemoveFromCollection={handleRemoveFromCollection}
      />
    </div>
  )
}
