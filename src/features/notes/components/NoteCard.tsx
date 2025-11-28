import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Note } from "../models/note.model";

export function NoteCard({ note }: { note: Note }) {
    return (
        <Card className="hover:shadow-md transition">
            <CardHeader>
                <CardTitle>{note.title}</CardTitle>
            </CardHeader>

            <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {note.content}
                </p>

                <p className="text-xs mt-2">
                    Mis à jour :{" "}
                    {new Date(note.updated_at).toLocaleDateString()}
                </p>
            </CardContent>
        </Card>
    );
}
