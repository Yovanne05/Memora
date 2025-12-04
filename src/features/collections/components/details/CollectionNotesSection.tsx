import { useMemo, useCallback, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { useNotesQuery } from "@/features/notes/hooks/useNotesQuery";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { CollectionNotesHeader, type NotesSort } from "./CollectionNotesHeader";
import { useUpdateNoteMutation } from "@/features/notes/hooks/useUpdateNoteMutation";
import type { Note } from "@/features/notes/models/note.model";
import { CollectionNotesGrid } from "./CollectionNotesGrid";
import type { AvailableNoteOption } from "../../types/note.types";

export function CollectionNotesSection() {
  const { id } = useParams({ from: "/app/collections/$id/" });
  const { userId } = useCurrentUser();

  // Notes dans la collection
  const { data, isLoading } = useNotesQuery(0, 20, { collectionId: id });

  // Notes dispo à ajouter
  const { data: allNotes } = useNotesQuery(0, 100, {});

  const availableNotes: AvailableNoteOption[] = useMemo(() => {
    const notes: Note[] = allNotes?.items ?? [];
    const filtered = notes.filter(
      (n) => n.ownerId === userId && !n.collectionId
    );
    return filtered.map((n) => ({ id: n.id, title: n.title }));
  }, [allNotes, userId]);

  const updateNoteMutation = useUpdateNoteMutation();
  const { mutateAsync, isPending } = updateNoteMutation;

  const [selected, setSelected] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<NotesSort>("recent");

  const handleAddExisting = useCallback(
    async (noteId?: string) => {
      if (!noteId) return;
      try {
        await mutateAsync({ noteId, payload: { collection_id: id } });
      } catch (err) {
        console.error("Failed to add note to collection", err);
      }
    },
    [id, mutateAsync]
  );

  const handleRemoveFromCollection = useCallback(
    async (noteId: string) => {
      try {
        await mutateAsync({ noteId, payload: { collection_id: null } });
      } catch (err) {
        console.error("Failed to remove note from collection", err);
      }
    },
    [mutateAsync]
  );

  const handleSelectNote = useCallback(
    (val: string) => {
      setSelected(val);
      handleAddExisting(val);
      setSelected("");
    },
    [handleAddExisting]
  );

  const filteredNotes = useMemo(() => {
    const notes: Note[] = data?.items ?? [];

    // Filter by search
    let filtered = notes;
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = notes.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          (n.content ?? "").toLowerCase().includes(q)
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      if (sort === "alphabetical") {
        return a.title.localeCompare(b.title);
      }
      if (sort === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      // recent
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return sorted;
  }, [data, search, sort]);

  return (
    <div className="space-y-6 rounded-2xl border border-border/50 bg-card/30 p-6 shadow-sm backdrop-blur-sm md:p-8">
      <CollectionNotesHeader
        availableNotes={availableNotes}
        selected={selected}
        isAdding={isPending}
        onSelectNote={handleSelectNote}
        searchValue={search}
        onSearchChange={setSearch}
        sortValue={sort}
        onSortChange={setSort}
      />

      <CollectionNotesGrid
        notes={filteredNotes}
        isLoading={isLoading}
        isUpdating={isPending}
        onRemoveFromCollection={handleRemoveFromCollection}
      />
    </div>
  );
}
