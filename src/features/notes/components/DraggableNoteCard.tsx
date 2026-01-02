import { useState } from "react"
import { GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Note } from "../models/note.model"
import { NoteCard } from "./list/NoteCard"

interface DraggableNoteCardProps {
  readonly note: Note
  readonly onActionComplete?: () => void
  readonly onDragStart?: (noteId: string) => void
  readonly onDragEnd?: () => void
}

export function DraggableNoteCard({
  note,
  onActionComplete,
  onDragStart,
  onDragEnd
}: Readonly<DraggableNoteCardProps>) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("application/json", JSON.stringify({
      noteId: note.id,
      noteTitle: note.title,
      currentCollectionId: note.collectionId
    }))
    onDragStart?.(note.id)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    onDragEnd?.()
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={cn(
        "relative group/draggable cursor-move transition-opacity",
        isDragging && "opacity-50"
      )}
    >
      <div className="absolute left-2 top-2 z-10 opacity-0 group-hover/draggable:opacity-100 transition-opacity">
        <div className="bg-background/80 backdrop-blur-sm rounded p-1 shadow-sm border border-border">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <NoteCard note={note} onActionComplete={onActionComplete} />
    </div>
  )
}
