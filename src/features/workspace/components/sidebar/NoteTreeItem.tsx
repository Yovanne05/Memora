import { FileText } from "lucide-react"
import type { Note } from "@/features/notes/models/note.model"
import { cn } from "@/lib/utils"

interface NoteTreeItemProps {
  note: Note
  isActive: boolean
  onClick: () => void
}

export function NoteTreeItem({ note, isActive, onClick }: NoteTreeItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        isActive && "bg-accent text-accent-foreground font-medium"
      )}
    >
      <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span className="truncate">{note.title || "Sans titre"}</span>
    </button>
  )
}
