import { useMemo, useCallback, useState } from "react"
import { useParams } from "@tanstack/react-router"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { NoteCard } from "@/features/notes/components/NoteCard"
import { useNotesQuery } from "@/features/notes/hooks/useNotesQuery"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { FormSelect } from "@/components/ui/form-select"
import { useUpdateNoteMutation } from "@/features/notes/hooks/useUpdateNoteMutation"

export function CollectionNotesSection() {
  const { id } = useParams({ from: "/app/collections/$id/" })
  const { userId } = useCurrentUser()

  // Notes currently in this collection
  const { data, isLoading } = useNotesQuery(0, 20, { collectionId: id })
  const notes = data?.items ?? []

  const { data: allData } = useNotesQuery(0, 100, {})
  const allNotes = allData?.items ?? []
  const availableNotes = allNotes.filter((n) => n.owner_id === userId && !n.collection_id)

  const updateNoteMutation = useUpdateNoteMutation()
  const [selected, setSelected] = useState("")

  const handleAddExisting = useCallback(
    async (noteId?: string) => {
      if (!noteId) return
      try {
        await updateNoteMutation.mutateAsync({ noteId, payload: { collection_id: id } })
      } catch (err) {
        console.error("Failed to add note to collection", err)
      }
    },
    [id, updateNoteMutation]
  )

  const total = data?.total ?? 0

  const header = useMemo(() => {
    return (
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Notes</h2>
        <div className="flex items-center gap-2">
          <FormSelect
            id="add-note"
            label="Nouvelle note"
            placeholder={updateNoteMutation.isPending ? "Ajout..." : "Sélectionner une note"}
            options={availableNotes.map((n) => ({ value: n.id, label: n.title }))}
            value={selected}
            onValueChange={(val) => {
              setSelected(val)
              handleAddExisting(val)
              setSelected("")
            }}
            disabled={updateNoteMutation.isPending || availableNotes.length === 0}
          />
        </div>
      </div>
    )
  }, [availableNotes, handleAddExisting, updateNoteMutation.isPending, selected])

  return (
    <div className="space-y-3">
      {header}

      <div>
        <Input placeholder="Rechercher des notes..." className="max-w-md" disabled />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-lg border p-4">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      ) : total ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Aucune note dans cette collection.</p>
      )}
    </div>
  )
}
