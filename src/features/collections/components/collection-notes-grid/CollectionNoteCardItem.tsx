import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { NoteCard } from "@/features/notes/components/NoteCard"
import type { Note } from "@/features/notes/models/note.model"
import { NoteLinkButton } from "./NoteLinkButton"

type CollectionNoteCardItemProps = {
  note: Note
  allNotes: Note[]
  isUpdating: boolean
  onRemoveFromCollection: (noteId: string) => void
}

export function CollectionNoteCardItem({
  note,
  allNotes,
  isUpdating,
  onRemoveFromCollection,
}: Readonly<CollectionNoteCardItemProps>) {
  return (
    <div className="group relative space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-border/80">
      <NoteCard note={note} showFavoriteButton />
      <div className="flex justify-between border-t border-border/50 pt-3 mt-3">
        <NoteLinkButton note={note} availableNotes={allNotes} />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemoveFromCollection(note.id)}
          disabled={isUpdating}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <X className="h-3.5 w-3.5 mr-1.5" />
          Retirer
        </Button>
      </div>
    </div>
  )
}
