import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useNotesQuery } from "../hooks/useNotesQuery";
import { NoteCard } from "../components/NoteCard";
import { NotesPagination } from "../components/NotesPagination";

export default function NotesPage() {
    const [page, setPage] = useState(0);
    const limit = 20;

    const [filters, setFilters] = useState({
        titleContains: "",
    });

    const { data, isLoading } = useNotesQuery(page, limit, filters);

    const total = data?.total ?? 0;
    const maxPage = Math.ceil(total / limit) - 1;

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Input
                    placeholder="Rechercher dans les titres..."
                    value={filters.titleContains}
                    onChange={(e) =>
                        setFilters({ ...filters, titleContains: e.target.value })
                    }
                    className="w-80"
                />

                <Button onClick={() => setPage(0)}>Filtrer</Button>
            </div>

            {isLoading && <p>Chargement...</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data?.items?.map((note) => (
                    <NoteCard key={note.id} note={note} />
                ))}
            </div>

            <NotesPagination page={page} maxPage={maxPage} setPage={setPage} />
        </div>
    );
}
