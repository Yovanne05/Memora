import { Badge } from "@/components/ui/badge"
import { getContentPreview } from "@/lib/html-utils"
import type { Note } from "../../models/note.model"

type QuickLinkNoteListProps = {
  availableNotes: Note[]
  isLoading: boolean
  isPending: boolean
  searchQuery: string
  onLink: (noteId: string, noteTitle: string) => void
}

export function QuickLinkNoteList({
  availableNotes,
  isLoading,
  isPending,
  searchQuery,
  onLink,
}: Readonly<QuickLinkNoteListProps>) {
  if (isLoading) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Chargement...
      </div>
    )
  }

  if (availableNotes.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        {searchQuery ? "Aucune note trouvée" : "Aucune note disponible"}
      </div>
    )
  }

  return (
    <>
      {availableNotes.map((availableNote) => (
        <button
          key={availableNote.id}
          type="button"
          onClick={() => onLink(availableNote.id, availableNote.title)}
          disabled={isPending}
          className="w-full text-left p-3 border-b last:border-b-0 hover:bg-accent transition-colors disabled:opacity-50"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{availableNote.title}</h4>
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                {getContentPreview(availableNote.content || "", 100)}
              </p>
            </div>
            {availableNote.tags.length > 0 && (
              <Badge variant="secondary" className="shrink-0 text-xs">
                {availableNote.tags.length}
              </Badge>
            )}
          </div>
        </button>
      ))}
    </>
  )
}
