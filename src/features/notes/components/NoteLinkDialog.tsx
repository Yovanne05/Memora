import { useState, useMemo } from "react"
import { Search } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

import { useNotesQuery } from "../hooks/useNotesQuery"
import { useCreateNoteLinkMutation } from "../hooks/useCreateNoteLinkMutation"
import type { Note } from "../models/note.model"
import type { NoteLink } from "../models/note-link.model"

interface NoteLinkDialogProps {
  note: Note
  existingLinks: NoteLink[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NoteLinkDialog({
  note,
  existingLinks,
  open,
  onOpenChange
}: NoteLinkDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)

  const { data: notesData, isLoading } = useNotesQuery(0, 100, {
    collection_id: note.collectionId,
  })

  const createLink = useCreateNoteLinkMutation(note.id)

  const existingLinkIds = useMemo(
    () => new Set(existingLinks.map(l => l.linkedNoteId)),
    [existingLinks]
  )

  const availableNotes = useMemo(() => {
    const notes = notesData?.items ?? []
    return notes
      .filter(n => n.id !== note.id)
      .filter(n => !existingLinkIds.has(n.id))
      .filter(n =>
        searchQuery === "" ||
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
  }, [notesData, note.id, existingLinkIds, searchQuery])

  const handleCreateLink = async () => {
    if (!selectedNoteId) return

    try {
      await createLink.mutateAsync({ linkedNoteId: selectedNoteId })
      setSelectedNoteId(null)
      setSearchQuery("")
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to create link:", error)
      alert(error instanceof Error ? error.message : "Impossible de créer le lien")
    }
  }

  const handleClose = () => {
    setSelectedNoteId(null)
    setSearchQuery("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Lier une note</DialogTitle>
          <DialogDescription>
            Sélectionnez une note de la même collection à lier
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex-1 overflow-y-auto border rounded-lg">
            {isLoading && (
              <div className="p-4 space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            )}

            {!isLoading && availableNotes.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                {searchQuery ? "Aucune note trouvée" : "Aucune note disponible"}
              </div>
            )}

            {!isLoading && availableNotes.map(availableNote => (
              <button
                key={availableNote.id}
                onClick={() => setSelectedNoteId(availableNote.id)}
                className={`w-full text-left p-4 border-b last:border-b-0 hover:bg-accent transition-colors ${
                  selectedNoteId === availableNote.id ? "bg-accent" : ""
                }`}
              >
                <h4 className="font-medium text-sm mb-1">{availableNote.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {availableNote.content}
                </p>
              </button>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button
            onClick={handleCreateLink}
            disabled={!selectedNoteId || createLink.isPending}
          >
            {createLink.isPending ? "Liaison..." : "Lier la note"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
