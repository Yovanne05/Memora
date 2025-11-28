import { Button } from "@/components/ui/button";

export function NotesPagination({
    page,
    maxPage,
    setPage,
}: {
    page: number;
    maxPage: number;
    setPage: (p: number) => void;
}) {
    return (
        <div className="flex justify-center items-center gap-4 mt-6">
            <Button
                variant="outline"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
            >
                Précédent
            </Button>

            <span>
                Page {page + 1} / {maxPage + 1}
            </span>

            <Button
                variant="outline"
                disabled={page >= maxPage}
                onClick={() => setPage(page + 1)}
            >
                Suivant
            </Button>
        </div>
    );
}
