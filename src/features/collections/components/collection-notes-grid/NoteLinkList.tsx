import type { Note } from "@/features/notes/models/note.model"
import { getContentPreview } from "@/lib/html-utils"

type NoteLinkListProps = {
  notes: Note[]
  linkedNoteIds: Set<string>
  isPending: boolean
  onToggle: (noteId: string) => void
}

export function NoteLinkList({
  notes,
  linkedNoteIds,
  isPending,
  onToggle,
}: Readonly<NoteLinkListProps>) {
  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto">
      {notes.map((targetNote) => {
        const isLinked = linkedNoteIds.has(targetNote.id)
        return (
          <button
            key={targetNote.id}
            onClick={() => onToggle(targetNote.id)}
            disabled={isPending}
            className="w-full text-left px-3 py-2.5 rounded-lg border border-border hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
              <div
                className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                  isLinked ? "bg-primary border-primary" : "border-muted-foreground/30"
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
                <p className="text-sm font-medium truncate">{targetNote.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {getContentPreview(targetNote.content || "", 100)}
                </p>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
