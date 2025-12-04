import { Link } from "@tanstack/react-router"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, LayoutGrid } from "lucide-react"

import type { Note } from "../models/note.model"
import { formatShortDate } from "@/lib/format.utils"

interface NoteCardProps {
    note: Note
    onPreview?: (note: Note) => void
}

export function NoteCard({ note, onPreview }: NoteCardProps) {
    const handlePreviewClick = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        onPreview?.(note)
    }

    return (
        <Link
            to="/app/notes/$id"
            params={{ id: note.id }}
            className="block"
        >
            <Card className="h-full border border-border/60 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <CardHeader className="space-y-3 pb-2">
                    <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-lg leading-tight line-clamp-2">
                            {note.title}
                        </CardTitle>

                        {onPreview && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={handlePreviewClick}
                                title="Aperçu rapide"
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                        <Badge variant="secondary">Aucune collection</Badge>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4 text-sm text-muted-foreground">
                    <p className="line-clamp-2 leading-relaxed">{note.content}</p>

                    <div className="flex flex-wrap items-center gap-3 text-xs">
                        <span className="flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" />
                            {note.visibility === "public" ? "Partagée" : "Privée"}
                        </span>

                        <span className="flex items-center gap-1">
                            Mis à jour le {formatShortDate(note.updatedAt)}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
