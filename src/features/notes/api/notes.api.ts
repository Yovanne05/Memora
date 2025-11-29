import type { Note, PaginatedNotes } from "../models/note.model";
import type { NotesFilters } from "../models/note-filters.model";

const API_URL = import.meta.env.VITE_API_URL;

export interface CreateNotePayload {
    title: string;
    content: string;
    owner_id: string;
    visibility: "private" | "public";
    collection_id?: string;
}

export async function fetchNotes({
    page,
    limit,
    filters,
}: {
    page: number;
    limit: number;
    filters: NotesFilters;
}): Promise<PaginatedNotes> {
    const params = new URLSearchParams();
    params.set("limit", limit.toString());
    params.set("offset", (page * limit).toString());

    for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null && value !== "") {
            params.set(key, String(value));
        }
    }

    const res = await fetch(`${API_URL}/notes?${params.toString()}`);
    if (!res.ok) throw new Error("Erreur API");

    return res.json();
}

export async function fetchNoteById(noteId: string): Promise<Note> {
    const res = await fetch(`${API_URL}/notes/${noteId}`);

    if (res.status === 404) {
        throw new Error("Note non trouvée");
    }

    if (!res.ok) {
        throw new Error("Erreur API");
    }

    return res.json();
}

export async function deleteNote(noteId: string): Promise<void> {
    const res = await fetch(`${API_URL}/notes/${noteId}`, {
        method: "DELETE",
    });

    if (!res.ok) {
        throw new Error("Erreur lors de la suppression de la note");
    }
}

export interface UpdateNotePayload {
    title?: string;
    content?: string;
    visibility?: "private" | "public";
    collection_id?: string | null;
}

export async function updateNote(noteId: string, payload: UpdateNotePayload): Promise<Note> {
    const res = await fetch(`${API_URL}/notes/${noteId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        throw new Error("Erreur lors de la mise à jour de la note");
    }

    return res.json();
}

export async function createNote(payload: CreateNotePayload): Promise<Note> {
    const res = await fetch(`${API_URL}/notes`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        throw new Error("Erreur lors de la création de la note");
    }

    return res.json();
}