import { useQuery } from "@tanstack/react-query";
import { fetchNoteById } from "../api/notes.api";
import type { Note } from "../models/note.model";

export function useNoteQuery(noteId: string) {
    return useQuery<Note>({
        queryKey: ["note", noteId],
        queryFn: () => fetchNoteById(noteId),
        retry: 1,
        enabled: Boolean(noteId),
    });
}