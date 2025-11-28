import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, LayoutGrid, User } from "lucide-react"

import type { Note } from "../models/note.model"

const formatDate = (date: string) =>
    new Intl.DateTimeFormat("en", {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(new Date(date))

export function NoteCard({ note }: { note: Note }) {
    return (
        <Card className="h-full border border-border/60 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <CardHeader className="space-y-3 pb-2">
                <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg leading-tight line-clamp-2">
                        {note.title}
                    </CardTitle>

                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                    <Badge variant="outline" className="capitalize">
                        {note.visibility} note
                    </Badge>

                    <Badge variant="secondary">
                        Collection {note.collection_id}
                    </Badge>

                    <Badge variant="outline" className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {note.owner_id}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p className="line-clamp-2 leading-relaxed">
                    {note.content}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {note.visibility === "public" ? "Shared" : "Private"}
                    </span>

                    <span className="flex items-center gap-1">
                        Updated on {formatDate(note.updated_at)}
                    </span>
                </div>
            </CardContent>
        </Card>
    )
}
