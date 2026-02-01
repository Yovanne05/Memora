import type { Collection } from "@/features/collections/models/collection.model"
import { FileQuestion } from "lucide-react"

interface OrphanNotesZoneProps {
  readonly collection: Collection
  readonly orphanNodeIds: Set<string>
  readonly onSelect?: (noteId: string) => void
}

export function OrphanNotesZone({
  collection,
  orphanNodeIds,
  onSelect,
}: Readonly<OrphanNotesZoneProps>) {
  const orphanNotes = collection.nodes.filter((node) => orphanNodeIds.has(node.id))

  if (orphanNotes.length === 0) {
    return null
  }

  return (
    <div className="border-t bg-muted/20 p-4">
      <div className="mb-3 flex items-center gap-2">
        <FileQuestion className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-muted-foreground">
          Notes orphelines ({orphanNotes.length})
        </h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {orphanNotes.map((note) => (
          <button
            key={note.id}
            type="button"
            className="cursor-pointer rounded-lg border border-border bg-card px-3 py-2 shadow-sm transition-all hover:border-primary hover:shadow-sm"
            title={note.data.title}
            onClick={() => onSelect?.(note.id)}
            aria-label={`Ouvrir la note orpheline ${note.data.title}`}
          >
            <div className="flex max-w-[200px] items-center gap-2">
              <div className="h-2 w-2 shrink-0 rounded-full bg-muted-foreground/50" />
              <span className="truncate text-sm">{note.data.title}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
