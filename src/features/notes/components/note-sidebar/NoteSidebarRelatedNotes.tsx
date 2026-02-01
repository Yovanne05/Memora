import { ChevronRight } from 'lucide-react'

import type { Note } from '../../models/note.model'

type NoteSidebarRelatedNotesProps = {
  notes: Note[]
  onNoteClick?: (noteId: string) => void
}

export function NoteSidebarRelatedNotes({
  notes,
  onNoteClick,
}: Readonly<NoteSidebarRelatedNotesProps>) {
  if (notes.length === 0) {
    return null
  }

  return (
    <div className="px-3 py-3 sm:px-6 sm:py-4 bg-muted/30">
      <h3 className="text-sm font-semibold text-muted-foreground mb-2 sm:mb-3">
        Notes liées ({notes.length})
      </h3>
      <div className="space-y-2">
        {notes.map((relatedNote) => (
          <button
            key={relatedNote.id}
            type="button"
            onClick={() => onNoteClick?.(relatedNote.id)}
            className="w-full text-left p-2 sm:p-3 rounded-lg border bg-background hover:bg-accent hover:border-accent-foreground/20 transition-colors group flex items-center justify-between gap-2"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {relatedNote.title}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-1">
                Contenu non disponible
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground shrink-0" />
          </button>
        ))}
      </div>
    </div>
  )
}
