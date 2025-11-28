export interface Note {
    id: string;
    title: string;
    content: string;
    owner_id: string;
    collection_id: string;
    visibility: "private" | "public";
    created_at: string;
    updated_at: string;
}

export interface PaginatedNotes {
    items: Note[];
    total: number;
}
