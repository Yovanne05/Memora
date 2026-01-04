import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { FileText, Pencil, Trash2 } from "lucide-react"
import type { Note } from "../../models/note.model"

interface NoteDetailsHeaderProps {
  note: Note
  onEdit: () => void
  onDelete: () => void
  isDeleting?: boolean
}

export function NoteDetailsHeader({ note, onEdit, onDelete, isDeleting }: Readonly<NoteDetailsHeaderProps>) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <FileText className="h-4 w-4" />
        <Link to="/app/workspace/notes" className="hover:text-foreground">
          Notes
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium text-foreground">{note.title}</span>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight">{note.title}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button className="gap-2" variant="secondary" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
            Modifier
          </Button>
          <Button className="gap-2" variant="destructive" onClick={onDelete} disabled={isDeleting}>
            <Trash2 className="h-4 w-4" />
            {isDeleting ? "Suppression..." : "Supprimer"}
          </Button>
        </div>
      </div>
    </div>
  )
}
