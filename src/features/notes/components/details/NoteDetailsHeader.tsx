import { Link } from "@tanstack/react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { FileText, Globe, Lock, NotebookPen, Pencil, Trash2 } from "lucide-react"
import type { Note } from "../../models/note.model"

interface NoteDetailsHeaderProps {
  note: Note
  onEdit: () => void
  onDelete: () => void
  isDeleting?: boolean
}

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date))

export function NoteDetailsHeader({ note, onEdit, onDelete, isDeleting }: Readonly<NoteDetailsHeaderProps>) {

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <FileText className="h-4 w-4" />
        <Link to="/app/notes" className="hover:text-foreground">
          Notes
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium text-foreground">{note.title}</span>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="secondary">{note.collectionId ? "Dans une collection" : "Sans collection"}</Badge>
            <Badge variant="outline" className="flex items-center gap-1 capitalize">
              {note.visibility === "public" ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
              {note.visibility === "public" ? "note publique" : "note privée"}
            </Badge>
          </div>

          <div className="space-y-1">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight">{note.title}</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <NotebookPen className="h-4 w-4" />
              Propriétaire {note.ownerId}
            </span>

            <Separator orientation="vertical" className="h-4" />

            <span>Créée le {formatDate(note.createdAt)}</span>

            <Separator orientation="vertical" className="h-4" />

            <span>Mise à jour le {formatDate(note.updatedAt)}</span>
          </div>
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
