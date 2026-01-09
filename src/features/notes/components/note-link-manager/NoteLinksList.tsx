import { Link } from "@tanstack/react-router"
import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Note } from "../../models/note.model"

type NoteLinksListProps = {
  notes: Note[]
  isLoading: boolean
  onDelete: (id: string) => void
}

export function NoteLinksList({
  notes,
  isLoading,
  onDelete,
}: Readonly<NoteLinksListProps>) {
  return (
    <CardContent className="space-y-3">
      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}

      {!isLoading && notes.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Aucune note liée
        </p>
      )}

      {!isLoading &&
        notes.map((linkedNote) => (
          <div
            key={linkedNote.id}
            className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{linkedNote.title}</h4>
              <p className="text-xs text-muted-foreground line-clamp-1">
                Contenu non disponible
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/app/workspace/notes/$noteId" params={{ noteId: linkedNote.id }}>
                  Voir
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => onDelete(linkedNote.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
    </CardContent>
  )
}
