import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { Note } from "../../models/note.model"
import { CalendarClock, FolderClosed, Globe, Lock, NotebookPen, Tag } from "lucide-react"

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

export function NoteDetailsContent({ note, paragraphs }: Readonly<NoteDetailsContentProps>) {
  return (
    <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
      <Card className="border border-border/70 shadow-sm">
        <CardContent className="space-y-4 text-base leading-relaxed text-foreground">
          {paragraphs.length ? (
            paragraphs.map((block, index) => (
              <p key={index} className="whitespace-pre-line text-muted-foreground">
                {block}
              </p>
            ))
          ) : (
            <p className="text-muted-foreground">Aucun contenu a afficher pour cette note.</p>
          )}
        </CardContent>
      </Card>

      <Card className="border border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Details</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <NotebookPen className="h-4 w-4" />
            <span className="text-foreground">Propriétaire</span>
            <span>{note.ownerUsername}</span>
          </div>

          <div className="flex items-center gap-2">
            <FolderClosed className="h-4 w-4" />
            <span className="text-foreground">Collection</span>
            <span>{note.collectionName ?? "Sans collection"}</span>
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

          {!!note.tags.length && (
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <div className="flex flex-wrap gap-1.5">
                {note.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="border-border bg-background">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

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
