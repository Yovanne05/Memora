import { memo } from "react"
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
import { useLinkNotes } from "../hooks/useLinkNotes"
import type { Note } from "../models/note.model"
import type { NoteLink } from "../models/note-link.model"
import { getContentPreview } from "@/lib/html-utils"

interface NoteLinkDialogProps {
  readonly note: Note
  readonly existingLinks: NoteLink[]
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
}

export const NoteLinkDialog = memo(function NoteLinkDialog({
  note,
  existingLinks,
  open,
  onOpenChange
}: Readonly<NoteLinkDialogProps>) {
  const {
    searchQuery,
    setSearchQuery,
    selectedNoteId,
    setSelectedNoteId,
    availableNotes,
    isLoading,
    isPending,
    handleCreateLink,
    resetState,
  } = useLinkNotes({
    note,
    existingLinks,
    onSuccess: () => onOpenChange(false),
  })

  const handleSubmit = async () => {
    if (!selectedNoteId) return
    const success = await handleCreateLink(selectedNoteId)
    if (!success) {
      alert("Impossible de créer le lien")
    }
  }

  const handleClose = () => {
    resetState()
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
                type="button"
                key={availableNote.id}
                onClick={() => setSelectedNoteId(availableNote.id)}
                className={`w-full text-left p-4 border-b last:border-b-0 hover:bg-accent transition-colors ${
                  selectedNoteId === availableNote.id ? "bg-accent" : ""
                }`}
              >
                <h4 className="font-medium text-sm mb-1">{availableNote.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {getContentPreview(availableNote.content || "", 150)}
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
            onClick={handleSubmit}
            disabled={!selectedNoteId || isPending}
          >
            {isPending ? "Liaison..." : "Lier la note"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})
