import type { PaginatedNotes } from "../models/note.model";
import type { NotesFilters } from "../models/note-filters.model";

const API_URL = import.meta.env.VITE_API_URL;

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
