import { useMemo, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
    LayoutGrid,
    List,
    Plus,
    Search,
    SlidersHorizontal,
} from "lucide-react";

import { useNotesQuery } from "../hooks/useNotesQuery";
import { NoteCard } from "../components/NoteCard";
import { NotesPagination } from "../components/NotesPagination";
import type { NotesFilters } from "../models/note-filters.model";
import { useCreateNoteMutation } from "../hooks/useCreateNoteMutation";

const sortOptions = [
    { label: "Last Modified", value: { sortBy: "updated_at", sortDir: "desc" } },
    { label: "Oldest Modified", value: { sortBy: "updated_at", sortDir: "asc" } },
    { label: "Title A-Z", value: { sortBy: "title", sortDir: "asc" } },
    { label: "Title Z-A", value: { sortBy: "title", sortDir: "desc" } },
    { label: "Newest", value: { sortBy: "created_at", sortDir: "desc" } },
] as const;

const visibilityFilters = [
    { label: "All notes", value: undefined },
    { label: "Shared", value: "public" },
    { label: "Private", value: "private" },
];

export default function NotesPage() {
    const router = useRouter();
    const [page, setPage] = useState(0);
    const limit = 12;

    const [view, setView] = useState<"grid" | "list">("grid");
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState<NotesFilters>({
        titleContains: "",
        sortBy: "updated_at",
        sortDir: "desc",
    });

    const { data, isLoading } = useNotesQuery(page, limit, filters);
    const createNoteMutation = useCreateNoteMutation();

    const total = data?.total ?? 0;
    const notes = data?.items ?? [];
    const maxPage = Math.max(0, Math.ceil(total / limit) - 1);

    const activeSortLabel = useMemo(() => {
        const match = sortOptions.find(
            (option) =>
                option.value.sortBy === filters.sortBy &&
                option.value.sortDir === filters.sortDir
        );
        return match?.label ?? "Last Modified";
    }, [filters.sortBy, filters.sortDir]);

    const handleSearch = () => {
        setFilters((prev) => ({ ...prev, titleContains: searchTerm }));
        setPage(0);
    };

    const handleSortChange = (sort: (typeof sortOptions)[number]["value"]) => {
        setFilters((prev) => ({ ...prev, ...sort }));
        setPage(0);
    };

    const handleVisibilityChange = (value: NotesFilters["visibility"]) => {
        setFilters((prev) => ({ ...prev, visibility: value }));
        setPage(0);
    };

    const resetFilters = () => {
        setSearchTerm("");
        setFilters({ titleContains: "", sortBy: "updated_at", sortDir: "desc" });
        setPage(0);
    };

    const handleCreateNote = async () => {
        try {
            const note = await createNoteMutation.mutateAsync({
                title: `New Note ${Date.now()}`,
                content: `Hello New Note ${Date.now()}`,
                visibility: "private",
                owner_id: "820437a5-ff21-4100-9859-9631efc66be7",
            });

            router.navigate({
                to: "/app/notes/$id/edit",
                params: { id: note.id },
            });
        } catch (error) {
            console.error("Failed to create note", error);
        }
    };

    return (
        <div className="space-y-6 p-6">
            <header className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                    <h1 className="text-3xl font-semibold tracking-tight">All Notes</h1>
                    <p className="text-sm text-muted-foreground">{total} notes</p>
                </div>

                <Button
                    size="lg"
                    className="gap-2"
                    onClick={handleCreateNote}
                    disabled={createNoteMutation.isPending}
                >
                    <Plus className="h-4 w-4" />
                    {createNoteMutation.isPending ? "Creating..." : "New Note"}
                </Button>
            </header>

            <div className="space-y-4 rounded-lg border bg-card p-4 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-1 flex-wrap items-center gap-3">
                        <div className="relative w-full min-w-[260px] flex-1 lg:w-80">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search notes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                className="pl-9"
                            />
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                    <SlidersHorizontal className="h-4 w-4" />
                                    Sort by {activeSortLabel}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuLabel>Sort</DropdownMenuLabel>
                                {sortOptions.map((option) => (
                                    <DropdownMenuItem
                                        key={option.label}
                                        onClick={() => handleSortChange(option.value)}
                                        className="cursor-pointer"
                                    >
                                        {option.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                    <LayoutGrid className="h-4 w-4" />
                                    Visibility
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuLabel>Visibility</DropdownMenuLabel>
                                {visibilityFilters.map((option) => (
                                    <DropdownMenuItem
                                        key={option.label}
                                        className="cursor-pointer"
                                        onClick={() =>
                                            handleVisibilityChange(
                                                option.value as NotesFilters["visibility"]
                                            )
                                        }
                                    >
                                        {option.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant={view === "grid" ? "default" : "outline"}
                            size="icon"
                            onClick={() => setView("grid")}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={view === "list" ? "default" : "outline"}
                            size="icon"
                            onClick={() => setView("list")}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant={!filters.visibility ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => handleVisibilityChange(undefined)}
                    >
                        All Notes
                    </Button>
                    <Button
                        variant={filters.visibility === "public" ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => handleVisibilityChange("public")}
                    >
                        Shared notes
                    </Button>
                    <Button
                        variant={filters.visibility === "private" ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => handleVisibilityChange("private")}
                    >
                        Private notes
                    </Button>
                    <Separator orientation="vertical" className="hidden h-6 lg:block" />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetFilters}
                        className="text-muted-foreground"
                    >
                        Reset
                    </Button>
                    <Button size="sm" onClick={handleSearch} className="gap-2">
                        <Search className="h-4 w-4" />
                        Apply search
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, idx) => (
                        <div key={idx} className="space-y-3 rounded-lg border p-4">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                        </div>
                    ))}
                </div>
            ) : notes.length ? (
                view === "grid" ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {notes.map((note) => (
                            <NoteCard key={note.id} note={note} />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notes.map((note) => (
                            <NoteCard key={note.id} note={note} />
                        ))}
                    </div>
                )
            ) : (
                <div className="flex h-48 items-center justify-center rounded-lg border text-muted-foreground">
                    No notes found. Try adjusting your filters.
                </div>
            )}

            <NotesPagination page={page} maxPage={maxPage} setPage={setPage} />
        </div>
    );
}
