export interface NotesFilters {
    ownerId?: string;
    collectionId?: string;
    sharedWithUserId?: string;
    visibility?: "private" | "public";
    titleContains?: string;
    contentContains?: string;
    ids?: string;
    tagIds?: string;
    sortBy?: "title" | "created_at" | "updated_at";
    sortDir?: "asc" | "desc";
}
