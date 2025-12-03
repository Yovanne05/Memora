import { Card } from "@/components/ui/card"
import type { CollectionVisualization } from "../types/visualization.type"
import { FileQuestion } from "lucide-react"

interface OrphanNotesZoneProps {
  data: CollectionVisualization
  orphanNodeIds: Set<string>
}

export function OrphanNotesZone({ data, orphanNodeIds }: OrphanNotesZoneProps) {
  const orphanNotes = data.nodes.filter((node) => orphanNodeIds.has(node.id))

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
          <Card
            key={note.id}
            className="cursor-pointer px-3 py-2 transition-all hover:border-primary hover:shadow-sm"
            title={note.title}
          >
            <div className="flex max-w-[200px] items-center gap-2">
              <div className="h-2 w-2 shrink-0 rounded-full bg-muted-foreground/50" />
              <span className="truncate text-sm">{note.title}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
