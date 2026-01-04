import { useState } from "react"
import { Button } from "@/components/ui/button"
import { NoteCard } from "@/features/notes/components/list/NoteCard"
import type { Note } from "@/features/notes/models/note.model"
import { X, Link2 } from "lucide-react"
import { GridLoadingState, GridEmptyState } from "./GridStates"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useCreateNoteLinkMutation } from "@/features/notes/hooks/useCreateNoteLinkMutation"
import { useDeleteNoteLinkMutation } from "@/features/notes/hooks/useDeleteNoteLinkMutation"
import { useNoteLinksQuery } from "@/features/notes/hooks/useNoteLinksQuery"

type CollectionNotesGridWithLinksProps = {
  readonly notes: Note[]
  readonly isLoading: boolean
  readonly isUpdating: boolean
  readonly onRemoveFromCollection: (noteId: string) => void
}

function NoteLinkButton({ note, availableNotes }: { readonly note: Note; readonly availableNotes: Note[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const { data: links } = useNoteLinksQuery(note.id)
  const createLink = useCreateNoteLinkMutation(note.id)
  const deleteLink = useDeleteNoteLinkMutation(note.id)

  const linkedNoteIds = new Set(links?.map(l => l.linkedNoteId) ?? [])
  const notesToShow = availableNotes.filter(n => n.id !== note.id)

  const handleToggleLink = async (targetNoteId: string) => {
    try {
      if (linkedNoteIds.has(targetNoteId)) {
        await deleteLink.mutateAsync(targetNoteId)
      } else {
        await createLink.mutateAsync({ linkedNoteId: targetNoteId })
      }
    } catch (error) {
      console.error("Failed to toggle link:", error)
    }
  }

  if (notesToShow.length === 0) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          <Link2 className="h-3.5 w-3.5 mr-1.5" />
          Lier ({linkedNoteIds.size})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Lier "{note.title}"</DialogTitle>
          <DialogDescription>
            Cochez les notes que vous souhaitez lier à cette note
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {notesToShow.map((targetNote) => {
            const isLinked = linkedNoteIds.has(targetNote.id)
            return (
              <button
                key={targetNote.id}
                onClick={() => handleToggleLink(targetNote.id)}
                disabled={createLink.isPending || deleteLink.isPending}
                className="w-full text-left px-3 py-2.5 rounded-lg border border-border hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                      isLinked
                        ? "bg-primary border-primary"
                        : "border-muted-foreground/30"
                    }`}
                  >
                    {isLinked && (
                      <svg
                        className="h-3.5 w-3.5 text-primary-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {targetNote.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {targetNote.content}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function CollectionNotesGridWithLinks({
  notes,
  isLoading,
  isUpdating,
  onRemoveFromCollection,
}: Readonly<CollectionNotesGridWithLinksProps>) {
  if (isLoading) {
    return <GridLoadingState />
  }

  if (!notes.length) {
    return <GridEmptyState />
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {notes.map((note) => (
        <div
          key={note.id}
          className="group relative space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-border/80"
        >
          <NoteCard note={note} />
          <div className="flex justify-between border-t border-border/50 pt-3 mt-3">
            <NoteLinkButton note={note} availableNotes={notes} />
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
      ))}
    </div>
  )
}
