import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { Note } from "../../models/note.model"
import { CalendarClock, Globe, Lock, NotebookPen } from "lucide-react"

interface NoteDetailsContentProps {
  note: Note
  paragraphs: string[]
}

const formatDateTime = (date: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))

export function NoteDetailsContent({ note, paragraphs }: NoteDetailsContentProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
      <Card className="border border-border/70 shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl">Contenu</CardTitle>
          <p className="text-sm text-muted-foreground">
            Tous les détails de la note sélectionnée.
          </p>
        </CardHeader>

        <CardContent className="space-y-4 text-base leading-relaxed text-foreground">
          {paragraphs.length ? (
            paragraphs.map((block, index) => (
              <p key={index} className="whitespace-pre-line text-muted-foreground">
                {block}
              </p>
            ))
          ) : (
            <p className="text-muted-foreground">Aucun contenu à afficher pour cette note.</p>
          )}
        </CardContent>
      </Card>

      <Card className="border border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Détails</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <NotebookPen className="h-4 w-4" />
            <span className="text-foreground">Propriétaire</span>
            <span>{note.ownerId}</span>
          </div>

          <div className="flex items-center gap-2">
            {note.visibility === "public" ? (
              <Globe className="h-4 w-4" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
            <span className="text-foreground">Visibilité</span>
            <span className="capitalize">{note.visibility === "public" ? "Publique" : "Privée"}</span>
          </div>

          <Separator />

          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            <span className="text-foreground">Créée</span>
            <span>{formatDateTime(note.createdAt)}</span>
          </div>

          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            <span className="text-foreground">Mise à jour</span>
            <span>{formatDateTime(note.updatedAt)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

